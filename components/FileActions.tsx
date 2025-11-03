'use client';

import { useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getTypeConfig } from '@/lib/customization-config';
import Modal from './Modal';

interface FileActionsProps {
  name: string;
  type: string;
  isLocal: boolean;
  basePath?: string; // Optional custom base path for project-specific files
  hideEdit?: boolean; // Hide edit button when already on edit page
}

interface ModalContent {
  title: string;
  message: ReactNode;
  onConfirm: () => void;
  confirmText: string;
}

export default function FileActions({ name, type, isLocal, basePath, hideEdit = false }: FileActionsProps) {
  const [deleting, setDeleting] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [message, setMessage] = useState('');
  const [modalContent, setModalContent] = useState<ModalContent | null>(null);
  const router = useRouter();

  const config = getTypeConfig(type);

  if (!isLocal || !config) {
    return null; // Only show actions for local files with valid config
  }

  const redirectUrl = basePath ? `/browse?project=${encodeURIComponent(basePath)}` : '/browse';

  const handleDelete = async () => {
    setModalContent(null);
    setDeleting(true);
    setMessage('');

    try {
      const url = new URL(`/api/files/${config.apiType}/${name}`, window.location.origin);
      if (basePath) {
        url.searchParams.set('basePath', basePath);
      }

      const response = await fetch(url.toString(), {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage(`✓ ${config.displayName} deleted successfully`);
        setTimeout(() => router.push(redirectUrl), 1500);
      } else {
        const data = await response.json();
        setMessage(`✗ ${data.error || `Failed to delete ${config.displayName.toLowerCase()}`}`);
      }
    } catch (error) {
      console.error(`Failed to delete ${config.displayName.toLowerCase()}:`, error);
      setMessage(`✗ Failed to delete ${config.displayName.toLowerCase()}`);
    } finally {
      setDeleting(false);
    }
  };

  const handleArchive = async () => {
    setModalContent(null);
    setArchiving(true);
    setMessage('');

    try {
      const url = new URL(`/api/files/${config.apiType}/${name}`, window.location.origin);
      if (basePath) {
        url.searchParams.set('basePath', basePath);
      }

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'archive' }),
      });

      if (response.ok) {
        setMessage(`✓ ${config.displayName} archived successfully`);
        setTimeout(() => router.push(redirectUrl), 1500);
      } else {
        const data = await response.json();
        setMessage(`✗ ${data.error || `Failed to archive ${config.displayName.toLowerCase()}`}`);
      }
    } catch (error) {
      console.error(`Failed to archive ${config.displayName.toLowerCase()}:`, error);
      setMessage(`✗ Failed to archive ${config.displayName.toLowerCase()}`);
    } finally {
      setArchiving(false);
    }
  };

  const confirmDelete = () => {
    setModalContent({
      title: `Delete ${config.displayName}`,
      message: `Are you sure you want to permanently delete this ${config.displayName.toLowerCase()}? This action cannot be undone.`,
      onConfirm: handleDelete,
      confirmText: 'Delete',
    });
  };

  const confirmArchive = () => {
    setModalContent({
      title: `Archive ${config.displayName}`,
      message: `Are you sure you want to archive this ${config.displayName.toLowerCase()}? You can restore it later from the .archived directory.`,
      onConfirm: handleArchive,
      confirmText: 'Archive',
    });
  };

  const editPath = basePath
    ? `${config.editPath(name)}?basePath=${encodeURIComponent(basePath)}`
    : config.editPath(name);

  return (
    <>
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Actions
        </h3>

        {message && (
          <div
            className={`mb-4 p-4 rounded-md ${
              message.startsWith('✓')
                ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'
            }`}
          >
            {message}
          </div>
        )}

        <div className="flex gap-4">
          {!hideEdit && (
            <Link
              href={editPath}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors inline-block"
            >
              ✏️ Edit
            </Link>
          )}

          {config.allowArchive && (
            <button
              onClick={confirmArchive}
              disabled={archiving || deleting}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white rounded-md font-medium transition-colors"
            >
              {archiving ? 'Archiving...' : '📦 Archive'}
            </button>
          )}

          {config.allowDelete && (
            <button
              onClick={confirmDelete}
              disabled={archiving || deleting}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-md font-medium transition-colors"
            >
              {deleting ? 'Deleting...' : '🗑️ Delete'}
            </button>
          )}
        </div>

        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          {config.allowArchive && (
            <>
              <p>
                <strong>Archive:</strong> Moves the {config.displayName.toLowerCase()} to{' '}
                <code>.archived/</code> (can be restored)
              </p>
            </>
          )}
          {config.allowDelete && (
            <p>
              <strong>Delete:</strong> Permanently removes the {config.displayName.toLowerCase()} from disk
            </p>
          )}
        </div>
      </div>

      {modalContent && (
        <Modal
          isOpen={!!modalContent}
          onClose={() => setModalContent(null)}
          onConfirm={modalContent.onConfirm}
          title={modalContent.title}
          confirmText={modalContent.confirmText}
        >
          {modalContent.message}
        </Modal>
      )}
    </>
  );
}
