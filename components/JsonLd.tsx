/**
 * Renders a JSON-LD block.
 *
 * Google reads structured data anywhere in the document, so this goes in the
 * page body rather than the head — which is what Next's metadata API leaves
 * room for, since it has no JSON-LD field of its own.
 */
export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // `<` is escaped so a value containing "</script>" could never close the
      // tag early. Nothing in the current data does, and this keeps it that way.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
