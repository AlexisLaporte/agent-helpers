'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface InstallButtonProps {
  name: string;
  type: 'skill' | 'command' | 'agent' | 'output-style';
  className?: string;
}

export default function InstallButton({ name, type, className = '' }: InstallButtonProps) {
  const [installing, setInstalling] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const router = useRouter();

  const handleInstall = async () => {
    if (!confirm(`Install "${name}"?\n\nThis will copy the template to your local ~/.claude directory.`)) {
      return;
    }

    setInstalling(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/install/${type}/${name}`, {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Installed successfully!' });
        // Refresh the page to update installation status
        setTimeout(() => {
          router.refresh();
        }, 1500);
      } else {
        setMessage({ type: 'error', text: data.error || 'Installation failed' });
      }
    } catch (error) {
      console.error('Failed to install:', error);
      setMessage({ type: 'error', text: 'Installation failed' });
    } finally {
      setInstalling(false);
    }
  };

  return (
    <div className={className}>
      {message && (
        <div
          className={`mb-3 p-3 rounded text-sm ${
            message.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300'
              : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'
          }`}
        >
          {message.text}
        </div>
      )}
      <button
        onClick={handleInstall}
        disabled={installing}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md font-medium transition-colors whitespace-nowrap"
      >
        {installing ? 'Installing...' : '📥 Install to Local'}
      </button>
    </div>
  );
}
