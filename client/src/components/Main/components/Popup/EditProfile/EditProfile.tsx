// client/src/components/Main/components/Popup/EditProfile/EditProfile.tsx

import { useContext } from 'react';

import CurrentUserContext from '../../../../../contexts/CurrentUserContext';
import { useFormValidation } from '../../../../../hooks/useFormValidation';

function EditProfile(): React.JSX.Element {
    const { currentUser, handleUpdateUser } = useContext(CurrentUserContext);

    const { values, errors, isValid, handleChange } = useFormValidation(
        { name: currentUser?.name || '', description: currentUser?.about || '' },
        true
    );

    function handleSubmit(event: React.SubmitEvent<HTMLFormElement>): void {
        event.preventDefault();
        handleUpdateUser({ name: values.name, about: values.description });
    }

    return (
        <form onSubmit={handleSubmit} className="popup__form form" id="edit-profile-form" noValidate>
        <input
            className={`popup__input popup__input_type_name ${errors.name ? 'form__input_type_error' : ''}`}
            minLength={2}
            maxLength={40}
            id="name"
            name="name"
            placeholder="Nombre"
            type="text"
            required
            value={values.name}
            onChange={handleChange}
        />
        <span className={`name-input-error form__input-error ${errors.name ? 'form__input-error_active' : ''}`}>
            {errors.name}
        </span>
        <input
            className={`popup__input popup__input_type_description ${errors.description ? 'form__input_type_error' : ''}`}
            minLength={2}
            maxLength={200}
            id="description"
            name="description"
            placeholder="Acerca de mí"
            type="text"
            required
            value={values.description}
            onChange={handleChange}
        />
        <span className={`description-input-error form__input-error ${errors.description ? 'form__input-error_active' : ''}`}>
            {errors.description}
        </span>
        <button className="button popup__button" type="submit" disabled={!isValid}>
            Guardar
        </button>
        </form>
    )
}

export default EditProfile;