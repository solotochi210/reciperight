import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import userApi from '../../api/user.api';
import { profileSchema } from '../../utils/validators';
import { useAuth } from '../../store/AuthContext';
import { useToast } from '../ui/Toast';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import ImageUpload from '../forms/ImageUpload';

export default function EditProfileModal({ open, onClose, user }) {
  const { setUser } = useAuth();
  const { success, error } = useToast();
  const queryClient = useQueryClient();
  const [avatar, setAvatar] = useState(user?.avatar || { url: '', publicId: '' });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name || '', bio: user?.bio || '' },
  });

  const mutation = useMutation({
    mutationFn: (data) => userApi.updateMe({ ...data, avatar }),
    onSuccess: (res) => {
      setUser(res.data.user);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      success('Profile updated');
      onClose();
    },
    onError: (err) => error(err.response?.data?.message || 'Could not update profile'),
  });

  return (
    <Modal open={open} onClose={onClose} title="Edit profile">
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-5">
        <div className="flex justify-center">
          <ImageUpload value={avatar} onChange={setAvatar} kind="avatar" compact />
        </div>
        <Input label="Name" error={errors.name?.message} {...register('name')} />
        <div>
          <textarea
            placeholder="Bio"
            rows={3}
            maxLength={280}
            {...register('bio')}
            className="w-full resize-none rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-[15px] outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
          {errors.bio && <p className="mt-1 text-xs text-red-500">{errors.bio.message}</p>}
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            Save
          </Button>
        </div>
      </form>
    </Modal>
  );
}
