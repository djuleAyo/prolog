import React, { useState, useEffect, ReactElement, useCallback } from 'react';
import ReactDOM from 'react-dom';
import styled, { keyframes } from 'styled-components';


const uuid = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const Stacker = styled.div`
  position: fixed;
  bottom: 0;
  right: 0;
  padding: 1em;
  z-index: 1000;
  display: grid;
  grid-auto-flow: dense;
  grid-auto-rows: minmax(100px, auto);
`;

const slideIn = keyframes`
  0% { right: -100%; }
  100% { right: 0; }
`;

const Toast = styled.div`
  position: relative;
  box-sizing: border-box;
  background: #00000055;
  animation: ${slideIn} 0.5s ease 1;
  padding: 1em;
  border-radius: 5px;
  margin-top: 1em;

  &:hover {
    background: #00000033;
  }
`

const ToastManager = ({ toasts, removeToast }: {
  toasts: Array<{
    id: string;
    component: ReactElement;
  }>;
  removeToast: (id: string) => void;
}) => {
  return ReactDOM.createPortal(
    <Stacker>
      {toasts.map((toast) => (
        <Toast key={toast.id} onClick={() => removeToast(toast.id)}>
          {toast.component}
        </Toast>
      ))}
    </Stacker>,
    document.body
  );
};

// Custom hook to manage toasts
const useToastManager = () => {
  const [toasts, setToasts] = useState<Array<{
    id: string;
    component: ReactElement;
  }>>([]);

  const removeToast = useCallback((id: string) => {
    const afterRemove = toasts.filter((toast) => toast.id !== id)
    console.log('afterRemove', afterRemove)
    setToasts(currentToasts => currentToasts.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((component: ReactElement) => {
    const id = uuid();
    console.log('id', id)
    setToasts(toasts => [...toasts, { id: id, component }]);
    setTimeout(() => {
      console.log('removeToast', id)
      removeToast(id)
    }, 5000);
  }, [removeToast])

  return { toasts, addToast, removeToast };
};

export const ToastRoot = () => {
  const { toasts, addToast, removeToast } = useToastManager();

  useEffect(() => {
    (window as any).toast = addToast;
  }, [addToast]);

  return <ToastManager toasts={toasts} removeToast={removeToast} />;
};
