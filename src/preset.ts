const managerEntries = (entry: string[] = []): string[] => [
  ...entry,
  require.resolve('./manager.js'),
];

export { managerEntries };
export { viteFinal } from '@/vite';
