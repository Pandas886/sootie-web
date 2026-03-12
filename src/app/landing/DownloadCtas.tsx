'use client';

import { Download, Laptop, Monitor } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function DownloadCtas() {
  return (
    <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row">
      <Dialog>
        <DialogTrigger asChild>
          <Button
            size="lg"
            className="bg-brand hover:bg-brand-hover text-primary-foreground rounded-full h-14 px-8 text-base shadow-sm w-full sm:w-auto"
          >
            <Download className="mr-2 w-5 h-5" />
            下载 macOS 版
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>选择你的 Mac 芯片</DialogTitle>
            <DialogDescription>
              Apple Silicon 适用于 M1、M2、M3、M4 系列，Intel 适用于老款 Intel Mac。
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 pt-2">
            <Button asChild size="lg" className="justify-start rounded-2xl h-auto px-5 py-4">
              <a href="/download/macos-arm64">
                <Laptop className="w-5 h-5" />
                <span>下载 Apple Silicon 版</span>
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="justify-start rounded-2xl h-auto px-5 py-4">
              <a href="/download/macos-x64">
                <Monitor className="w-5 h-5" />
                <span>下载 Intel 版</span>
              </a>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Button asChild size="lg" variant="outline" className="rounded-full h-14 px-8 text-base border-border hover:bg-secondary w-full sm:w-auto">
        <a href="/download/windows">
          <Monitor className="mr-2 w-5 h-5" />
          下载 Windows 版
        </a>
      </Button>
    </div>
  );
}
