import { useContext } from 'react';

import type { CardData } from '../../../../interfaces/CardData';
import type { ModalData } from '../../../../interfaces/ModalData';
import CurrentUserContext from '../../../../contexts/CurrentUserContext';
import ImagePopup from '../Popup/ImagePopup/ImagePopup';

type CardProps = {
  card: CardData;
  handleOpenPopup: (popup: ModalData) => void;
  handleCardLike: (card: CardData) => void;
  handleCardDelete: (card: CardData) => void;
};

function Card({ card, handleOpenPopup, handleCardLike, handleCardDelete }: CardProps): React.JSX.Element {
  const { currentUser } = useContext(CurrentUserContext);

  const isOwn = card.owner === currentUser?._id;

  const cardLikeButtonClassName = `card__like-button ${
    card.isLiked ? 'card__like-button_is-active' : ''
  }`;

  const imagePopup: ModalData = {
    children: <ImagePopup card={card} />,
  };

  return (
    <li className="card">
      <img
        className="card__image"
        src={card.link}
        alt={card.name}
        onClick={() => handleOpenPopup(imagePopup)}
      />

      {isOwn && (
        <button
          type="button"
          className="card__delete-button"
          aria-label="Delete card"
          onClick={() => handleCardDelete(card)}
        />
      )}

      <div className="card__description">
        <h2 className="card__title">{card.name}</h2>

        <button
          type="button"
          className={cardLikeButtonClassName}
          aria-label="Like card"
          onClick={() => handleCardLike(card)}
        />
      </div>
    </li>
  );
}

export default Card;