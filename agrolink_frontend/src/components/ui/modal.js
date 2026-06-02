import React from 'react';

export function Modal({ open, title, message, onClose, okLabel = 'OK' }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 z-10">
        <div className="p-4 border-b">
          <h3 className="text-lg font-medium">{title}</h3>
        </div>
        <div className="p-4">
          <p className="text-sm text-gray-700">{message}</p>
        </div>
        <div className="p-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            {okLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Modal;
