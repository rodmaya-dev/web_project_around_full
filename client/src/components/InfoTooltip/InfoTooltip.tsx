import successIcon from '../../images/success.svg';
import failIcon from '../../images/fail.svg';
import type { InfoTooltipStatus } from '../../interfaces/InfoTooltipStatus';

type InfoTooltipProps = {
  status: InfoTooltipStatus | null;
  onClose: () => void;
};

const TOOLTIP_CONTENT: Record<InfoTooltipStatus, { icon: string; message: string }> = {
  success: {
    icon: successIcon,
    message: '¡Correcto! Ya estás registrado.',
  },
  error: {
    icon: failIcon,
    message: 'Algo salió mal. Por favor, inténtalo de nuevo.',
  },
};

function InfoTooltip({ status, onClose }: InfoTooltipProps): React.JSX.Element | null {
  if (status === null) {
    return null;
  }

  const { icon, message } = TOOLTIP_CONTENT[status];

  return (
    <div
      className="popup popup_type_tooltip popup_is-opened"
      role="dialog"
      aria-modal="true"
      aria-label={message}
    >
      <div className="popup__content popup__content_type_tooltip">
        <button
          aria-label="Cerrar"
          className="popup__close"
          type="button"
          onClick={onClose}
        />
        <img className="popup__tooltip-icon" src={icon} alt="" />
        <h3 className="popup__title">{message}</h3>
      </div>
    </div>
  );
}

export default InfoTooltip;