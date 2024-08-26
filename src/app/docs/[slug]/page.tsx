import { format, parseISO } from 'date-fns';
import { allDocPages } from 'contentlayer/generated';
import DocLayout from '@/components/DocumentLayout';

// export const generateStaticParams = async () =>
//   allDocPages.map((doc) => ({ slug: doc._raw.flattenedPath }));

// export const generateMetadata = ({ params }: { params: { slug: string } }) => {
//   console.log(params);

//   const doc = allDocPages.find(
//     (doc) => doc._raw.flattenedPath === `docs/${params.slug}`
//   );
//   if (!doc) throw new Error(`Post not found for slug: ${params.slug}`);
//   return { title: doc.title };
// };

const DocPageComponent = ({ params }: { params: { slug: string } }) => {
  const doc = allDocPages.find(
    (doc) => doc._raw.flattenedPath === `docs/${params.slug}`
  );
  if (!doc) throw new Error(`Post not found for slug: ${params.slug}`);

  return (
    <DocLayout>
      <article className="mx-auto max-w-xl py-8">
        <div className="mb-8 text-center">
          {/* <time dateTime={doc.date} className="mb-1 text-xs text-gray-600">
            {format(parseISO(doc.date), 'LLLL d, yyyy')}
          </time> */}
          <h1 className="text-3xl font-bold">{doc.title}</h1>
        </div>
        <div
          className="[&>*]:mb-3 [&>*:last-child]:mb-0"
          dangerouslySetInnerHTML={{ __html: doc.body.html }}
        />
      </article>
    </DocLayout>
  );
};

export default DocPageComponent;
