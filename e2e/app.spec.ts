import { expect, test } from '@playwright/test';

async function clearAppStorage(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
}

test('todo create, complete, edit and batch delete flow', async ({ page }) => {
  await clearAppStorage(page);

  await page.getByRole('button', { name: '新建待办' }).click();
  await page.getByLabel('描述').fill('E2E 待办');
  await page.getByLabel('开始时间').fill('09:00');
  await page.getByLabel('结束时间').fill('10:00');
  await page.getByRole('button', { name: '添加' }).click();
  await expect(page.getByText('E2E 待办')).toBeVisible();

  await page.getByRole('button', { name: '标记为完成' }).first().click();
  await page.getByRole('button', { name: /编辑待办:E2E 待办/ }).click();
  await page.getByLabel('描述').fill('E2E 待办编辑');
  await page.getByRole('button', { name: '保存' }).click();
  await expect(page.getByText('E2E 待办编辑')).toBeVisible();

  await page.getByRole('button', { name: /编辑待办:E2E 待办编辑/ }).click({ button: 'right' });
  await page.getByRole('button', { name: /编辑待办:E2E 待办编辑/ }).hover();
  await page.mouse.down();
  await page.waitForTimeout(550);
  await page.mouse.up();
  await page.getByRole('button', { name: '删除选中项' }).click();
  await expect(page.getByRole('dialog', { name: '确认删除' })).toBeVisible();
});

test('expense overview, detail edit and persistence flow', async ({ page }) => {
  await clearAppStorage(page);
  await page.getByRole('button', { name: '支出' }).click();
  await expect(page.getByText('本月支出')).toBeVisible();

  await page.getByRole('button', { name: '记一笔' }).click();
  await page.getByLabel('描述').fill('E2E 奶茶');
  await page.getByLabel('金额').fill('18.5');
  await page.getByRole('button', { name: '添加' }).click();

  await page.getByRole('button', { name: /饮食/ }).click();
  await expect(page.getByText('饮食支出')).toBeVisible();
  await expect(page.getByText('E2E 奶茶')).toBeVisible();
  await page.getByRole('button', { name: /E2E 奶茶/ }).click();
  await page.getByRole('tab', { name: '居住' }).click();
  await page.getByRole('button', { name: '保存' }).click();
  await page.getByRole('button', { name: '返回支出总览' }).click();
  await page.getByRole('button', { name: /居住/ }).click();
  await expect(page.getByText('E2E 奶茶')).toBeVisible();

  await page.reload();
  await expect(page.getByRole('button', { name: '支出' })).toHaveAttribute('aria-current', 'page');
  await expect(page.getByText('本月支出')).toBeVisible();
  await page.getByRole('button', { name: /居住/ }).click();
  await expect(page.getByText('E2E 奶茶')).toBeVisible();
});

test('health profile, bp validation, chart switch and pagination flow', async ({ page }) => {
  await clearAppStorage(page);
  await page.getByRole('button', { name: '健康' }).click();
  await expect(page.getByText('健康跟踪')).toBeVisible();

  await page.getByRole('button', { name: '设置个人资料' }).click();
  await page.getByLabel('年龄').fill('60');
  await page.getByRole('button', { name: '保存' }).click();
  await expect(page.getByRole('dialog', { name: '个人资料' })).toBeHidden();

  await page.getByRole('button', { name: '新增数据' }).click();
  await page.getByRole('dialog', { name: '新增数据' }).getByRole('tab', { name: '血压' }).click();
  await page.getByLabel('收缩压').fill('80');
  await page.getByLabel('舒张压').fill('90');
  await expect(page.getByRole('button', { name: '添加' })).toBeDisabled();
  await page.getByLabel('收缩压').fill('128');
  await page.getByRole('button', { name: '添加' }).click();
  await expect(page.getByRole('tab', { name: '血压' })).toHaveAttribute('aria-selected', 'true');

  await page.getByRole('img', { name: '血压近一个月折线图' }).hover();
  await expect(page.getByText(/测量记录/)).toBeVisible();
  await page.getByRole('button', { name: '下一页' }).click();
  await expect(page.getByRole('button', { name: '1', exact: true })).not.toHaveAttribute('aria-current', 'page');
});
