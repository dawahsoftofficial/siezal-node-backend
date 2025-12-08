import { DataSource } from "typeorm";
import * as XLSX from "xlsx";
import * as fs from "fs";
import * as path from "path";
import * as mime from "mime-types";

import { Category } from "../entities/category.entity";
import { Product } from "../entities/product.entity";
import { EProductUnit } from "src/common/enums/product-unit.enum";
import { EInventoryStatus } from "src/common/enums/inventory-status.enum";
// import { S3Service } from "src/shared/aws/s3.service";
import { ConfigService } from "@nestjs/config";

interface ImageFolder {
  name: string;
  path: string;
  parent?: string;
  images: string[];
  subFolders: ImageFolder[];
}

export default class RealProductSeeder {
  private static usedSlugs = new Set<string>();

  constructor() { }

  private static makeUniqueSlug(title: string): string {
    let slug = title
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    let uniqueSlug = slug;
    let counter = 2;
    while (this.usedSlugs.has(uniqueSlug)) {
      uniqueSlug = `${slug}-${counter++}`;
    }
    this.usedSlugs.add(uniqueSlug);
    return uniqueSlug;
  }

  // private static readImageDir(dirPath: string, parent?: string): ImageFolder {
  //   const folder: ImageFolder = {
  //     name: path.basename(dirPath),
  //     path: dirPath,
  //     parent,
  //     images: [],
  //     subFolders: [],
  //   };

  //   const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  //   for (const entry of entries) {
  //     const fullPath = path.join(dirPath, entry.name);

  //     if (entry.isDirectory()) {
  //       // Recurse into subfolder
  //       const subFolder = RealProductSeeder.readImageDir(fullPath, folder.name);
  //       folder.subFolders.push(subFolder);
  //     } else {
  //       // Treat file as image
  //       const ext = path.extname(entry.name).toLowerCase();
  //       if ([".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext)) {
  //         folder.images.push(fullPath);
  //       }
  //     }
  //   }

  //   return folder;
  // }

  private static slugify(input: string): string {
    return input
      .toLowerCase()
      // replace everything except letters, numbers, |, and - with "-"
      .replace(/[^a-z0-9|]+/g, "-")
      // collapse multiple "-" into one
      .replace(/-+/g, "-")
      // trim leading/trailing "-"
      .replace(/^-+|-+$/g, "");
  }

  private static buildMaps(
    folder: ImageFolder,
    imageMap: Map<string, string>,
    imageParentMap: Map<string, string>,
    parentPath: string[] = []
  ) {
    const currentPath = [...parentPath, folder.name];

    // Add images in current folder
    for (const imgPath of folder.images) {
      const name = path.parse(imgPath).name;

      imageMap.set(name, imgPath);

      // Parent chain (excluding the image file itself)
      imageParentMap.set(name, RealProductSeeder.slugify(currentPath.join("|")).replace("images|", ""));
    }

    // Recurse into subfolders
    for (const sub of folder.subFolders) {
      RealProductSeeder.buildMaps(sub, imageMap, imageParentMap, currentPath);
    }
  }


  public static async run(dataSource: DataSource): Promise<void> {
    const configService = new ConfigService();
    // const s3Service = new S3Service(configService);

    const categoryRepo = dataSource.getRepository(Category);
    const productRepo = dataSource.getRepository(Product);

    const excelPath = path.join(__dirname, "../../data/products.xlsx");

    const workbook = XLSX.readFile(excelPath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows: any[] = XLSX.utils.sheet_to_json(sheet);

    const categoryMap = new Map<string, number>();
    const parentMap = new Map<string, number>();

    await dataSource.transaction(async (manager) => {
      // const structure = RealProductSeeder.readImageDir(imageDir);

      // const jsonPath = path.join(__dirname, "image-structure.json");
      // fs.writeFileSync(jsonPath, JSON.stringify(structure, null, 2), "utf-8");

      const jsonPath = path.join(__dirname, "../../data/image-structure.json");
      const structure = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

      const imageMap = new Map<string, string>();
      const titleToCategoryMap = new Map<string, string>();

      RealProductSeeder.buildMaps(structure, imageMap, titleToCategoryMap);

      const products: Product[] = [];

      const uploadedImagesFilePath = path.join(__dirname, "../../data/image-title-map.json");
      const uploadedImagesMap: { [key: string]: string } = JSON.parse(fs.readFileSync(uploadedImagesFilePath, "utf-8"));
      // const uploadedImagesMap = {};

      let parentPosition = 1;
      let childPosition = 1;

      for (const row of rows) {
        const title: string = row["Title"];
        let categorySlug = titleToCategoryMap.get(title)

        if (!categorySlug) {
          categorySlug = 'misc|other'
        }

        const [parentNameRaw, childNameRaw] = categorySlug.split("|");
        const parentName = parentNameRaw.trim().replace(/-/g, " ").split(" ").map(word => {
          return word.charAt(0).toUpperCase() + word.slice(1);
        })
          .join(" ");
        const childName = childNameRaw ? childNameRaw.trim().replace(/-/g, " ").split(" ").map(word => {
          return word.charAt(0).toUpperCase() + word.slice(1);
        })
          .join(" ") : undefined;
        const catKey = childName ? `${parentName} - ${childName}` : parentName;

        let categoryId = categoryMap.get(catKey);

        if (!categoryId) {
          let parentId = parentMap.get(parentName);

          if (!parentId) {
            const parent = categoryRepo.create({
              name: parentName,
              slug: parentName.toLowerCase().replace(/\s+/g, "-"),
              icon: "placeholder.svg",
              images: ["placeholder.svg"],
              slideShow: false,
              isFeatured: true,
              position: parentPosition++,
            });

            const savedParent = await manager.save(parent);

            parentId = savedParent.id;
            parentMap.set(parentName, parentId!);
          }

          if (childName) {
            const child = categoryRepo.create({
              name: childName,
              slug: childName.toLowerCase().replace(/\s+/g, "-"),
              icon: "placeholder.svg",
              images: ["placeholder.svg"],
              slideShow: false,
              isFeatured: false,
              position: childPosition++,
              parentId,
            });

            const savedChild = await manager.save(child);

            categoryId = savedChild.id;
            categoryMap.set(catKey, categoryId!);
          } else {
            categoryId = parentId;
            categoryMap.set(catKey, categoryId!);
          }
        }

        let imageUrl = uploadedImagesMap[title] || "placeholder.svg"

        // const imageFilePath = imageMap.get(title);

        // if (imageFilePath) {
        //   const buffer = fs.readFileSync(imageFilePath);

        //   const fakeFile: Express.Multer.File = {
        //     fieldname: "file",
        //     originalname: path.basename(imageFilePath),
        //     encoding: "7bit",
        //     mimetype: mime.lookup(imageFilePath) || "image/jpeg",
        //     size: buffer.length,
        //     buffer,
        //     stream: fs.createReadStream(imageFilePath),
        //     destination: "",
        //     filename: path.basename(imageFilePath),
        //     path: imageFilePath,
        //   };

        //   const { url } = await s3Service.uploadImage(fakeFile, "import");

        //   // uploadedImagesMap[title] = url;

        //   imageUrl = url;
        // }

        // parentPosition += 1

        // if (parentPosition % 100 === 0) {
        //   console.log('Progress:', Object.keys(uploadedImagesMap).length)
        // }

        const skuCell = row["SKU"];
        const skus =
          typeof skuCell === "string"
            ? skuCell
                .split(",")
                .map((value) => value.trim())
                .filter(Boolean)
            : skuCell
            ? [String(skuCell)]
            : [];

        const product = productRepo.create({
          sku: skus,
          title,
          slug: this.makeUniqueSlug(title),
          shortDescription: row["Short Description"],
          description: row["Description"],
          seoTitle: row["SEO Title"],
          seoDescription: row["SEO Description"],
          price: parseFloat(row["Price"] || 100) || 100,
          salePrice: row["Sale Price"] || 0
            ? parseFloat(row["Sale Price"])
            : undefined,
          stockQuantity: 100,
          status: row['Status'] ? row['Status'] as EInventoryStatus : EInventoryStatus.OUT_OF_STOCK,
          categoryId,
          inventoryId: 1,
          image: imageUrl,
          unit: EProductUnit.PIECE,
          isGstEnabled: true,
          gstFee: 18
        });

        products.push(product);
      }

      await manager.save(products);

      // fs.writeFileSync(uploadedImagesFilePath, JSON.stringify(uploadedImagesMap, null, 2), "utf-8");

      // console.log(uploadedImagesMap)
      console.log(`✅ Seeded ${products.length} products with categories`);
    });
  }
}
