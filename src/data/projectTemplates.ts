export type ProjectTemplateItem = {
  id: string;
  title: string;
  source: string;
  tags: string[];
  recommended?: boolean;
};

export const RECOMMENDED_PROJECT_TEMPLATE: ProjectTemplateItem = {
  id: 'rec-1',
  title: '装饰装修工程施工招标文件范本',
  source: '贵州公共资源交易中心 装饰工程范本 2024',
  tags: ['建设工程', '贵州', '我的收藏'],
  recommended: true,
};

export const PROJECT_TEMPLATE_LIBRARY: ProjectTemplateItem[] = [
  {
    id: 'lib-1',
    title: '装饰装潢施工招标文件范本',
    source: '贵州公共资源交易中心 装饰工程范本 2024',
    tags: ['贵州', '装饰', '2024版'],
  },
  {
    id: 'lib-2',
    title: '装饰装潢施工招标文件范本',
    source: '贵州公共资源交易中心 装饰工程范本 2024',
    tags: ['贵州', '装饰', '2024版'],
  },
  {
    id: 'lib-3',
    title: '装饰装潢施工招标文件范本',
    source: '贵州公共资源交易中心 装饰工程范本 2024',
    tags: ['贵州', '装饰', '2024版'],
  },
];

export function resolveProjectTemplate(id: string): ProjectTemplateItem {
  if (id === RECOMMENDED_PROJECT_TEMPLATE.id) {
    return RECOMMENDED_PROJECT_TEMPLATE;
  }
  return PROJECT_TEMPLATE_LIBRARY.find((item) => item.id === id) ?? RECOMMENDED_PROJECT_TEMPLATE;
}
