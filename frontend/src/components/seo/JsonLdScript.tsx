import type { JsonLdEntity } from "@/lib/seo/site";

interface JsonLdScriptProps {
  entities: JsonLdEntity[];
}

export function JsonLdScript({ entities }: JsonLdScriptProps) {
  return (
    <>
      {entities.map((entity, index) => (
        <script
          // The order is stable because entities are generated from static SEO config.
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(entity) }}
        />
      ))}
    </>
  );
}
