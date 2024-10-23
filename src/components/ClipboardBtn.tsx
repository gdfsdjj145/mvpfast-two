import { useState } from 'react';
import Clipboard from 'clipboard';

const ClipboardCopyButton = (props) => {
  const { children, cb, text } = props;

  const handleClick = () => {
    const clipboard: any = new Clipboard('.copy-button', {
      text: () => text,
    });

    clipboard.on('success', () => {
      cb();
      // Reset success message after 3 seconds
      clipboard.destroy(); // Cleanup clipboard instance
    });

    clipboard.on('error', (e) => {
      console.error('Failed to copy:', e);
      clipboard.destroy(); // Cleanup clipboard instance
    });

    // clipboard.onClick({ delegateTarget: { className: 'copy-button' } });
  };

  return (
    <div className="copy-button" onClick={handleClick}>
      {children}
    </div>
  );
};

export default ClipboardCopyButton;
