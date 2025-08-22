import { DataSource } from "typeorm";
import * as XLSX from "xlsx";
import * as fs from "fs";
import * as path from "path";
import * as mime from "mime-types";

import { Category } from "../entities/category.entity";
import { Product } from "../entities/product.entity";
import { EProductUnit } from "src/common/enums/product-unit.enum";
import { EInventoryStatus } from "src/common/enums/inventory-status.enum";
import { S3Service } from "src/shared/aws/s3.service";
import { ConfigService } from "@nestjs/config";

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

    public static async run(dataSource: DataSource): Promise<void> {
        const configService = new ConfigService();
        const s3Service = new S3Service(configService);

        const categoryRepo = dataSource.getRepository(Category);
        const productRepo = dataSource.getRepository(Product);

        const excelPath = path.join(__dirname, "../../data/products.xlsx");
        const imageDir = path.join(__dirname, "../../data/images");

        const workbook = XLSX.readFile(excelPath);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows: any[] = XLSX.utils.sheet_to_json(sheet);

        const categoryMap = new Map<string, number>();
        const parentMap = new Map<string, number>();

        await dataSource.transaction(async (manager) => {
            const imageFiles = fs.readdirSync(imageDir);

            const imageMap = new Map<string, string>();

            imageFiles.forEach((file) => {
                const name = path.parse(file).name.toLowerCase();
                imageMap.set(name, path.join(imageDir, file));
            });

            const products: Product[] = [];

            let parentPosition = 1;
            let childPosition = 1;

            for (const row of rows) {
                const title: string = row["Title"];
                const categorySlug: string = row["  Category-Slug"];

                const [parentNameRaw, childNameRaw] = categorySlug.split(" - ");
                const parentName = parentNameRaw.trim();
                const childName = childNameRaw.trim();
                const catKey = `${parentName} - ${childName}`;

                let categoryId = categoryMap.get(catKey);
                if (!categoryId) {
                    let parentId = parentMap.get(parentName);

                    if (!parentId) {
                        const parent = categoryRepo.create({
                            name: parentName,
                            slug: parentName.toLowerCase().replace(/\s+/g, "-"),
                            icon: "placeholder-icon.png",
                            images: ["placeholder-image.png"],
                            slideShow: false,
                            isFeatured: true,
                            position: parentPosition++,
                        });

                        const savedParent = await manager.save(parent);

                        parentId = savedParent.id;
                        parentMap.set(parentName, parentId!);
                    }

                    const child = categoryRepo.create({
                        name: childName,
                        slug: childName.toLowerCase().replace(/\s+/g, "-"),
                        icon: "placeholder-icon.png",
                        images: ["placeholder-image.png"],
                        slideShow: false,
                        isFeatured: false,
                        position: childPosition++,
                        parentId,
                    });

                    const savedChild = await manager.save(child);

                    categoryId = savedChild.id;
                    categoryMap.set(catKey, categoryId!);
                }

                const imageFilePath = imageMap.get(title.toLowerCase());

                if (!imageFilePath) {
                    console.warn(`⚠️ Image not found for product: ${title}`);
                    continue;
                }

                const buffer = fs.readFileSync(imageFilePath);

                const fakeFile: Express.Multer.File = {
                    fieldname: "file",
                    originalname: path.basename(imageFilePath),
                    encoding: "7bit",
                    mimetype: mime.lookup(imageFilePath) || "image/jpeg",
                    size: buffer.length,
                    buffer,
                    stream: fs.createReadStream(imageFilePath),
                    destination: "",
                    filename: path.basename(imageFilePath),
                    path: imageFilePath,
                };

                const { url } = await s3Service.uploadImage(fakeFile);

                const product = productRepo.create({
                    sku: row["SKU"],
                    title,
                    slug: this.makeUniqueSlug(title),
                    shortDescription: row["  Short Description"],
                    description: row["  Description"],
                    seoTitle: row["  SEO Title"],
                    seoDescription: row["  SEO Description"],
                    price: parseFloat(row["  Price"]),
                    salePrice: row["  Sale Price"] ? parseFloat(row["  Sale Price"]) : undefined,
                    stockQuantity: parseInt(row["  Stock Quantity"], 10) || 0,
                    status: EInventoryStatus.AVAILABLE,
                    categoryId,
                    inventoryId: 1,
                    image: url,
                    unit: EProductUnit.PIECE,
                    isGSTEnabled: true,
                });

                products.push(product);
            }

            await manager.save(products);
            console.log(`✅ Seeded ${products.length} products with categories`);
        });
    }
}