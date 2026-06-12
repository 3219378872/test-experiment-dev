import { useState } from 'react';
import { Modal } from 'shared/components';
import type { Gender, Profile } from '../lib';

type ProfileDialogProps = {
  open: boolean;
  profile: Profile;
  onClose: () => void;
  onSave: (profile: Profile) => void;
};

export function ProfileDialog({ open, profile, onClose, onSave }: ProfileDialogProps) {
  const [formKey, setFormKey] = useState(`${profile.gender}-${profile.age}-${profile.height}-${profile.weight}`);
  const [gender, setGender] = useState<Gender>(() => profile.gender);
  const [age, setAge] = useState(() => String(profile.age));
  const [height, setHeight] = useState(() => String(profile.height));
  const [weight, setWeight] = useState(() => String(profile.weight));
  const nextKey = `${profile.gender}-${profile.age}-${profile.height}-${profile.weight}`;

  if (open && formKey !== nextKey) {
    setFormKey(nextKey);
    setGender(profile.gender);
    setAge(String(profile.age));
    setHeight(String(profile.height));
    setWeight(String(profile.weight));
  }

  const parsedAge = Number.parseInt(age, 10);
  const parsedHeight = Number.parseFloat(height);
  const parsedWeight = Number.parseFloat(weight);
  const valid = parsedAge >= 1 && parsedAge <= 120 && parsedHeight >= 80 && parsedHeight <= 250 && parsedWeight >= 20 && parsedWeight <= 300;

  const submit = () => {
    if (!valid) {
      return;
    }

    onSave({ gender, age: parsedAge, height: parsedHeight, weight: parsedWeight });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="个人资料"
      footer={
        <>
          <button type="button" className="btn-ghost" onClick={onClose}>
            取消
          </button>
          <button type="button" className="btn-primary" disabled={!valid} onClick={submit}>
            保存
          </button>
        </>
      }
    >
      <div className="dialog-fields profile-fields">
        <div className="field">
          <span>性别</span>
          <div className="seg-row">
            <button type="button" className={`seg-btn${gender === 'male' ? ' is-active' : ''}`} onClick={() => setGender('male')}>
              男
            </button>
            <button type="button" className={`seg-btn${gender === 'female' ? ' is-active' : ''}`} onClick={() => setGender('female')}>
              女
            </button>
          </div>
        </div>
        <div className="field-grid2">
          <label className="field">
            <span>年龄</span>
            <input type="number" value={age} min="1" max="120" inputMode="numeric" onChange={(event) => setAge(event.target.value)} />
          </label>
          <label className="field">
            <span>身高 (cm)</span>
            <input type="number" value={height} min="80" max="250" inputMode="decimal" onChange={(event) => setHeight(event.target.value)} />
          </label>
        </div>
        <label className="field">
          <span>体重 (kg)</span>
          <input type="number" value={weight} min="20" max="300" step="0.1" inputMode="decimal" onChange={(event) => setWeight(event.target.value)} />
        </label>
      </div>
    </Modal>
  );
}
