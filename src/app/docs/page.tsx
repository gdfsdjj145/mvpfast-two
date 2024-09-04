import { allDocPages } from 'contentlayer/generated';
import DocLayout from '@/components/DocumentLayout';

const DocsIndexPage = () => {
  const sortedDocs = allDocPages.sort((a, b) => a.order - b.order);
  return (
    <DocLayout>
      <ul>
        {sortedDocs.map((doc) => (
          <li key={doc._id}>
            <a href={doc.url}>{doc.title}</a>
          </li>
        ))}
      </ul>
    </DocLayout>
  );
};

export default DocsIndexPage;
