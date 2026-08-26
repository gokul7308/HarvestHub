import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/card';

interface SettingSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function SettingSection({ title, description, children }: SettingSectionProps) {
  return (
    <Card className="shadow-sm border-gray-100 bg-white/80 backdrop-blur-md">
      <CardHeader className="border-b border-gray-50 pb-4 mb-4">
        <CardTitle className="text-lg text-slate-900">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-6">
        {children}
      </CardContent>
    </Card>
  );
}
