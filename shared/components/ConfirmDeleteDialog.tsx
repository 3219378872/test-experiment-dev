import { Modal } from './Modal';

type ConfirmDeleteDialogProps = {
  open: boolean;
  count: number;
  noun: string;
  onYes: () => void;
  onNo: () => void;
};

export function ConfirmDeleteDialog({ open, count, noun, onYes, onNo }: ConfirmDeleteDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onNo}
      title="确认删除"
      footer={
        <>
          <button type="button" className="btn-ghost" onClick={onNo}>
            否
          </button>
          <button type="button" className="btn-primary btn-danger" onClick={onYes}>
            是,删除
          </button>
        </>
      }
    >
      <p className="confirm-text">
        确定要删除选中的 <b>{count}</b> {noun}吗?删除后无法恢复。
      </p>
    </Modal>
  );
}
