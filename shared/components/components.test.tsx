import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddButton, BatchXButton, ConfirmDeleteDialog, GearButton, Modal, Pager, TrashButton, TypePicker } from './index';

describe('shared components', () => {
  it('renders modal content and closes on backdrop click', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const { container } = render(
      <Modal open title="资料" onClose={onClose} footer={<button type="button">保存</button>}>
        <p>内容</p>
      </Modal>,
    );

    expect(screen.getByRole('dialog', { name: '资料' })).toBeTruthy();
    fireEvent.click(container.firstElementChild as Element);
    expect(onClose).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole('button', { name: '保存' }));
  });

  it('changes type picker value', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <TypePicker
        value="food"
        onChange={onChange}
        options={[
          { id: 'food', label: '饮食', glyph: '食', hue: 40 },
          { id: 'home', label: '居住', glyph: '住', hue: 150 },
        ]}
      />,
    );

    expect(screen.getByRole('tab', { name: '饮食' }).getAttribute('aria-selected')).toBe('true');
    await user.click(screen.getByRole('tab', { name: '居住' }));
    expect(onChange).toHaveBeenCalledWith('home');
  });

  it('renders icon buttons and batch x state', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    const onGear = vi.fn();
    const onTrash = vi.fn();
    const onToggle = vi.fn();
    render(
      <>
        <AddButton label="新建" onClick={onAdd} />
        <GearButton label="资料设置" onClick={onGear} />
        <TrashButton count={3} onClick={onTrash} />
        <BatchXButton selected onToggle={onToggle} />
      </>,
    );

    await user.click(screen.getByRole('button', { name: '新建' }));
    await user.click(screen.getByRole('button', { name: '资料设置' }));
    await user.click(screen.getByRole('button', { name: '删除选中项' }));
    await user.click(screen.getByRole('button', { name: '取消删除标记' }));

    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onGear).toHaveBeenCalledTimes(1);
    expect(onTrash).toHaveBeenCalledTimes(1);
    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(screen.getByText('3')).toBeTruthy();
  });

  it('confirms delete actions', async () => {
    const user = userEvent.setup();
    const onYes = vi.fn();
    const onNo = vi.fn();
    render(<ConfirmDeleteDialog open count={2} noun="条待办" onYes={onYes} onNo={onNo} />);

    expect(screen.getByText(/删除选中的/)).toBeTruthy();
    await user.click(screen.getByRole('button', { name: '否' }));
    await user.click(screen.getByRole('button', { name: '是,删除' }));

    expect(onNo).toHaveBeenCalledTimes(1);
    expect(onYes).toHaveBeenCalledTimes(1);
  });

  it('shows at most three pages and clamps arrows', async () => {
    const user = userEvent.setup();
    const onPage = vi.fn();
    render(<Pager page={4} pages={8} onPage={onPage} />);

    expect(screen.getByRole('button', { name: '3' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '4' }).getAttribute('aria-current')).toBe('page');
    expect(screen.getByRole('button', { name: '5' })).toBeTruthy();

    await user.click(screen.getByRole('button', { name: '上一页' }));
    await user.click(screen.getByRole('button', { name: '下一页' }));
    await user.click(screen.getByRole('button', { name: '5' }));

    expect(onPage).toHaveBeenNthCalledWith(1, 3);
    expect(onPage).toHaveBeenNthCalledWith(2, 5);
    expect(onPage).toHaveBeenNthCalledWith(3, 5);
  });

  it('handles pager edge windows and hidden single-page state', () => {
    const onPage = vi.fn();
    const { rerender, container } = render(<Pager page={1} pages={1} onPage={onPage} />);
    expect(container.firstElementChild).toBeNull();

    rerender(<Pager page={1} pages={3} onPage={onPage} />);
    expect(screen.getByRole('button', { name: '1' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '上一页' })).toHaveProperty('disabled', true);

    rerender(<Pager page={8} pages={8} onPage={onPage} />);
    expect(screen.getByRole('button', { name: '6' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '8' }).getAttribute('aria-current')).toBe('page');
    expect(screen.getByRole('button', { name: '下一页' })).toHaveProperty('disabled', true);
  });
});
