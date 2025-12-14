import React from 'react';
import Button from '../ui/Button';
import { useToast } from '../toast/useToast';

const ToastExample = () => {
  const { showToast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText('Hello world');
      showToast({ type: 'success', message: 'Copié !' });
    } catch {
      showToast({ type: 'error', message: 'Impossible de copier' });
    }
  };

  const handleEditBanner = () => {
    showToast({ type: 'info', message: "Action d'édition confirmée" });
  };

  return (
    <div className="flex gap-3">
      <Button onClick={handleCopy} className="bg-[#D6BA69] text-black">Copy</Button>
      <Button onClick={handleEditBanner} variant="outline">Edit Banner</Button>
    </div>
  );
};

export default ToastExample;
