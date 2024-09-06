export function cn(...classes: any) {
  return classes.filter(Boolean).join(' ');
}

export const renderText = (name: string) => {
  return (name && name.slice(0, 1)) || '';
};
