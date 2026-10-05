import { useContext } from 'react';

import CurrentUserContext from '../../../../../contexts/CurrentUserContext';
import { useFormValidation } from '../../../../../hooks/useFormValidation';

function NewCard(): React.JSX.Element {
    const { handleAddPlaceSubmit } = useContext(CurrentUserContext);

    const { values, errors, isValid, handleChange } = useFormValidation({ name: '', link: '' });

    function handleSubmit(event: React.SubmitEvent<HTMLFormElement>): void {
        event.preventDefault();
        handleAddPlaceSubmit({ name: values.name, link: values.link });
    }

    return (
        <form onSubmit={handleSubmit} className="popup__form form" id="new-place-form" noValidate>
        <input
            className={`popup__input popup__input_type_name ${errors.name ? 'form__input_type_error' : ''}`}
            minLength={2}
            maxLength={30}
            id="place-name"
            name="name"
            placeholder="Título"
            type="text"
            required
            value={values.name}
            onChange={handleChange}
        />
        <span className={`place-name-input-error form__input-error ${errors.name ? 'form__input-error_active' : ''}`}>
            {errors.name}
        </span>
        <input
            className={`popup__input popup__input_type_description ${errors.link ? 'form__input_type_error' : ''}`}
            id="place-link"
            name="link"
            placeholder="Enlace a la imagen"
            type="url"
            required
            value={values.link}
            onChange={handleChange}
        />
        <span className={`place-link-input-error form__input-error ${errors.link ? 'form__input-error_active' : ''}`}>
            {errors.link}
        </span>
        <button className="button popup__button" type="submit" disabled={!isValid}>
            Crear
        </button>
        </form>
    )
}

export default NewCard;