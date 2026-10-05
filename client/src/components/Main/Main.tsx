// client/src/components/Main/Main.tsx

import { useContext } from "react";

import type { ModalData } from "../../interfaces/ModalData";
import type { CardData } from "../../interfaces/CardData";
import CurrentUserContext from "../../contexts/CurrentUserContext";

import Popup from "./components/Popup/Popup";
import NewCard from "./components/Popup/NewCard/NewCard";
import EditProfile from "./components/Popup/EditProfile/EditProfile";
import EditAvatar from "./components/Popup/EditAvatar/EditAvatar";
import Card from "./components/Card/Card";

import avatarPlaceholder from "../../images/avatar.jpg";

type MainProps = {
    cards: CardData[];
    popup: ModalData | null;
    handleOpenPopup: (popup: ModalData) => void;
    handleClosePopup: () => void;
    handleCardLike: (card: CardData) => void;
    handleCardDelete: (card: CardData) => void;
};

function Main({ cards, popup, handleOpenPopup, handleClosePopup, handleCardLike, handleCardDelete }: MainProps): React.JSX.Element {
    const { currentUser } = useContext(CurrentUserContext);

    const newCardPopup: ModalData = {
        title: 'Nuevo lugar',
        children: <NewCard />
    };

    const editProfile: ModalData = {
        title: 'Editar Perfil',
        children: <EditProfile/>
    };

    const editAvatar: ModalData = {
        title: 'Actualizar foto de perfil',
        children: <EditAvatar/>
    };

  return (
    <main className="content">
        <section className="profile page__section">
          <div className="profile__image-container">
            <img
              className="profile__image"
              src={currentUser?.avatar ?? avatarPlaceholder} 
              alt={currentUser?.name ?? "Avatar"}
              id="profile-avatar"
            />
            <button
              className="profile__image-edit-button"
              type="button"
              aria-label="Editar avatar"
              onClick={() => handleOpenPopup(editAvatar)}
            ></button>
          </div>
          <div className="profile__info">
            <h1 className="profile__title">{currentUser?.name}</h1>
            <button
              aria-label="Editar perfil"
              className="profile__edit-button"
              type="button"
              onClick={() => handleOpenPopup(editProfile)}
            ></button>
            <p className="profile__description">{currentUser?.about}</p>
          </div>
          <button
            aria-label="Agregar tarjeta"
            className="profile__add-button"
            type="button"
            onClick={() => handleOpenPopup(newCardPopup)}
          ></button>
        </section>
        <section className="cards page__section">
            <ul className="cards__list">
                {cards.map((card) => (
                <Card
                  key={card._id}
                  card={card}
                  handleOpenPopup={handleOpenPopup}
                  handleCardLike={handleCardLike}
                  handleCardDelete={handleCardDelete}
                />
                ))}
            </ul>
        </section>
        {popup && (
            <Popup
                onClose={handleClosePopup}  
                title={popup.title}
                isOpen={popup !== null}
                >
                {popup.children}
            </Popup>
        )}
      </main>
    );
}

export default Main;