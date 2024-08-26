import { allDocPages } from 'contentlayer/generated';
import DocLayout from '@/components/DocumentLayout';

const DocsIndexPage = () => {
  return (
    <DocLayout>
      <ul>
        {allDocPages.map((doc) => (
          <li key={doc._id}>
            <a href={doc.url}>{doc.title}</a>
          </li>
        ))}
      </ul>
    </DocLayout>
  );
};

export default DocsIndexPage;
