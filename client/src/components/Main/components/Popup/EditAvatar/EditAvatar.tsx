import { useRef, useState, useContext } from 'react';

import CurrentUserContext from '../../../../../contexts/CurrentUserContext';

function EditAvatar(): React.JSX.Element {
    const { handleUpdateAvatar } = useContext(CurrentUserContext);

    const avatarRef = useRef<HTMLInputElement>(null);

    const [error, setError] = useState('');
    const [isValid, setIsValid] = useState(false);

    function handleChange(event: React.ChangeEvent<HTMLInputElement>): void {
        setError(event.target.validationMessage);
        setIsValid(event.target.validity.valid);
    }

    function handleSubmit(event: React.SubmitEvent<HTMLFormElement>): void {
        event.preventDefault();
        if (avatarRef.current) {
            handleUpdateAvatar(avatarRef.current.value);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="popup__form form" id="avatar-form" noValidate>
        <input
            className={`popup__input ${error ? 'form__input_type_error' : ''}`}
            id="avatar-link"
            name="avatar-link"
            placeholder="Enlace a la imagen"
            required
            type="url"
            ref={avatarRef}
            onChange={handleChange}
        />
        <span className={`avatar-link-input-error form__input-error ${error ? 'form__input-error_active' : ''}`}>
            {error}
        </span>
        <button className="button popup__button" type="submit" disabled={!isValid}>
            Guardar
        </button>
        </form>
    )
}

export default EditAvatar;