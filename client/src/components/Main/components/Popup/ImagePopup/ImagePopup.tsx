import type { CardData } from "../../../../../interfaces/CardData";

type CardProps = {
  card: CardData;
};

function ImagePopup({ card: { name, link } }: CardProps) {

    return (
        <>
        <img alt={name} className="popup__image" src={link} />
        <p className="popup__caption">{name}</p>
        </>
    )
}

export default ImagePopup;