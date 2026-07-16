import type { Comment } from '../types/comment';

export const seedComments: Omit<Comment, 'pageNumber' | 'rect'>[] = [
  {
    id: 'comment-1',
    selectedText: '无正当理由拒签合同',
    content: '这个内容需要与招标人再次核实',
    authorName: '李静',
    createdAt: '2026.5.6 12:26:11',
    searchText: '无正当理由拒签合同',
    pageHint: 32,
  },
  {
    id: 'comment-2',
    selectedText: '投标截止时间',
    content: '建议补充具体日期，避免投标人理解歧义',
    authorName: '李静',
    createdAt: '2026.5.6 14:08:42',
    searchText: '投标截止时间',
    pageHint: 14,
  },
];
