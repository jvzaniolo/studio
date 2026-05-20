import { useNavigate } from 'react-router';
import { Overview } from '~/materialidade/matrix';

export default function MaterialidadePage() {
  const navigate = useNavigate();

  return (
    <Overview
      onPickTheme={id => navigate(`/materialidade/tema/${id}`)}
    />
  );
}
