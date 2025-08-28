import { DataSource } from 'typeorm';
import { Attribute } from '../entities/attribute.entity';

type AttributeDef = {
    name: string;
    slug?: string;
    children?: Omit<AttributeDef, 'children'>[];
};

export default class AttributeSeeder {
    public static async run(dataSource: DataSource): Promise<void> {
        const repo = dataSource.getRepository(Attribute);

        await dataSource.transaction(async (tem) => {
            // await tem.clear(Attribute);

            const makeSlug = (name: string) =>
                name.toLowerCase()
                    .replace(/&/g, 'and')
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)+/g, '');

            const attributes: AttributeDef[] = [
                {
                    name: 'Condition',
                    children: [
                        { name: 'Fresh' },
                        { name: 'Frozen' },
                        { name: 'Dried' },
                    ],
                },
                {
                    name: 'Origin',
                    children: [
                        { name: 'Local' },
                        { name: 'Imported' },
                    ],
                },
                {
                    name: 'Certification',
                    children: [
                        { name: 'Organic' },
                        { name: 'Non-GMO' },
                        { name: 'Fair Trade' },
                    ],
                },
                {
                    name: 'Diet',
                    children: [
                        { name: 'Vegan' },
                        { name: 'Vegetarian' },
                        { name: 'Gluten-Free' },
                    ],
                },
                {
                    name: 'Packaging',
                    children: [
                        { name: 'Loose' },
                        { name: 'Packaged' },
                        { name: 'Bulk' },
                    ],
                },
            ];

            const saveTree = async (defs: AttributeDef[], parentId?: number) => {
                for (const def of defs) {
                    const entity = repo.create({
                        name: def.name,
                        slug: def.slug || makeSlug(def.name),
                        parentId: parentId ?? undefined,
                    });
                    const saved = await tem.save(entity);

                    if (def.children?.length) {
                        await saveTree(def.children, saved.id);
                    }
                }
            };

            await saveTree(attributes);
        });
    }
}
