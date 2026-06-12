import { useMemo, useState } from 'react';
import { AddButton, ConfirmDeleteDialog, GearButton, Pager, TrashButton } from 'shared/components';
import { useBatchDelete } from 'shared/hooks';
import { fmtDayShort } from 'shared/utils/format';
import { HealthAddDialog, HealthChart, ProfileDialog, RecordCard } from 'features/health/components';
import { dailyNodes, dayAnchor, idealRange, rangeStatus, useHealthStore, type HealthMetricId } from 'features/health';

const recordPageSize = 5;
const warnFrac = 0.2;

export function HealthPage() {
  const { records, profile, addRecord, deleteRecords, saveProfile } = useHealthStore();
  const [metricId, setMetricId] = useState<HealthMetricId>('weight');
  const [addOpen, setAddOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [openRecord, setOpenRecord] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [today] = useState(() => dayAnchor(Date.now()));
  const batch = useBatchDelete<string>();
  const range = idealRange(metricId, profile);
  const nodes = useMemo(
    () =>
      dailyNodes(records, metricId).map((node) => ({
        ...node,
        status: rangeStatus(node.value, idealRange(metricId, profile), warnFrac),
      })),
    [metricId, profile, records],
  );
  const pages = Math.max(1, Math.ceil(records.length / recordPageSize));
  const safePage = Math.min(page, pages);
  const pageRecords = records.slice((safePage - 1) * recordPageSize, safePage * recordPageSize);

  return (
    <div className="page health-page">
      <header className="page-head">
        <div>
          <h1>健康跟踪</h1>
          <p className="page-sub">近一个月 · {fmtDayShort(today - 30 * 86_400_000)} – 今天</p>
        </div>
        <div className="head-actions">
          <GearButton label="设置个人资料" onClick={() => setProfileOpen(true)} />
          {batch.active ? <TrashButton count={batch.selected.size} onClick={() => setConfirmOpen(true)} /> : <AddButton label="新增数据" onClick={() => setAddOpen(true)} />}
        </div>
      </header>

      <HealthChart nodes={nodes} range={range} metricId={metricId} profile={profile} warnFrac={warnFrac} onMetricChange={setMetricId} dayEnd={today} />

      <div className="rec-section-head">
        <h2>测量记录</h2>
        <span className="rec-count">共 {records.length} 条</span>
      </div>
      <div className="rec-list">
        {pageRecords.map((record, index) => (
          <RecordCard
            key={record.id}
            record={record}
            profile={profile}
            warnFrac={warnFrac}
            open={openRecord === record.id}
            onToggle={() => setOpenRecord((value) => (value === record.id ? null : record.id))}
            batch={batch}
            shakeDelay={`${-(index % 3) * 0.1}s`}
          />
        ))}
      </div>
      <Pager
        page={safePage}
        pages={pages}
        onPage={(nextPage) => {
          setPage(nextPage);
          setOpenRecord(null);
        }}
      />

      <ProfileDialog open={profileOpen} onClose={() => setProfileOpen(false)} profile={profile} onSave={saveProfile} />
      <HealthAddDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={(record) => {
          addRecord(record);
          setMetricId(record.metric);
          setPage(1);
          setOpenRecord(null);
        }}
      />
      <ConfirmDeleteDialog
        open={confirmOpen}
        count={batch.selected.size}
        noun="条记录"
        onNo={() => setConfirmOpen(false)}
        onYes={() => {
          deleteRecords([...batch.selected]);
          setConfirmOpen(false);
          batch.exit();
        }}
      />
    </div>
  );
}
