import { useNavigate } from 'react-router';
import { Mapeamentos } from '~/materialidade/mapeamentos';

export default function MapeamentosPage() {
  const navigate = useNavigate();

  return (
    <Mapeamentos
      onPickTheme={id => navigate(`/materialidade/tema/${id}`)}
    />
  );
}
