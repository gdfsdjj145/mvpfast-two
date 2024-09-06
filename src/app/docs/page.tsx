import { allDocPages } from 'contentlayer/generated';
import DocLayout from '@/components/DocumentLayout';
import Link from 'next/link';

interface DocGroup {
  [key: string]: typeof allDocPages;
}

// 文件夹名称映射
const folderNames: { [key: string]: string } = {
  start: '开始工作',
  dev: '开发教程',
  // 添加更多文件夹映射...
};

const DocsIndexPage = () => {
  // 按文件夹分组文档
  const groupedDocs = allDocPages.reduce((acc: DocGroup, doc) => {
    const folder = doc.url.split('/')[2] || 'root'; // 假设 URL 格式为 /docs/folder/file
    if (!acc[folder]) {
      acc[folder] = [];
    }
    acc[folder].push(doc);
    return acc;
  }, {});

  // 对每个分组内的文档按 order 排序
  Object.keys(groupedDocs).forEach((folder) => {
    groupedDocs[folder].sort((a, b) => a.order - b.order);
  });

  return (
    <DocLayout>
      {Object.entries(groupedDocs).map(([folder, docs]) => (
        <div key={folder} className="mb-8">
          <h2 className="text-2xl font-bold mb-4">
            {folderNames[folder] || folder}
          </h2>
          <ul className="space-y-2">
            {docs.map((doc) => (
              <li key={doc._id} className="hover:bg-gray-100 p-2 rounded">
                <Link href={doc.url} className="text-blue-600 hover:underline">
                  {doc.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </DocLayout>
  );
};

export default DocsIndexPage;
