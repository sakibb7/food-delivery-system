import React from 'react';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Table({ children, className = '' }: Props) {
  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <table className="w-full text-left border-collapse">
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children }: Props) {
  return <thead className="bg-gray-50 border-y border-gray-100">{children}</thead>;
}

export function TableBody({ children }: Props) {
  return <tbody className="divide-y divide-gray-100">{children}</tbody>;
}

export function TableRow({ children, className = '' }: Props) {
  return <tr className={`hover:bg-gray-50/50 transition-colors ${className}`}>{children}</tr>;
}

export function TableHead({ children, className = '' }: Props) {
  return (
    <th className={`px-6 py-4 text-sm font-medium text-gray-500 whitespace-nowrap ${className}`}>
      {children}
    </th>
  );
}

export function TableCell({ children, className = '' }: Props) {
  return (
    <td className={`px-6 py-4 text-sm text-gray-700 whitespace-nowrap ${className}`}>
      {children}
    </td>
  );
}
