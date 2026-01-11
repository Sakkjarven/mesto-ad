/*
  Файл index.js является точкой входа в наше приложение
  и только он должен содержать логику инициализации нашего приложения
  используя при этом импорты из других файлов

  Из index.js не допускается что то экспортировать
*/
import {
  getUserInfo,
  getCardList,
  setUserInfo,
  setUserAvatar,
  addCard,
  deleteCard as deleteCardAPI,
  changeLikeCardStatus,
} from "./components/api.js";
import { createCardElement, deleteCard, likeCard } from "./components/card.js";
import {
  openModalWindow,
  closeModalWindow,
  setCloseModalWindowEventListeners,
} from "./components/modal.js";
import { enableValidation, clearValidation } from "./components/validation.js";

// DOM узлы
const placesWrap = document.querySelector(".places__list");
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(
  ".popup__input_type_description"
);

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");

let currentUser_id = null;

const formatDate = (date) =>
  date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  const button = profileForm.querySelector(".popup__button");
  button.textContent = "Сохранение...";
  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
    .then((userData) => {
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      closeModalWindow(profileFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    });
};

const handleAvatarFromSubmit = (evt) => {
  evt.preventDefault();
  const button = avatarForm.querySelector(".popup__button");
  button.textContent = "Сохранение...";
  setUserAvatar({
    avatar: avatarInput.value,
  })
    .then((userData) => {
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
      closeModalWindow(avatarFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    });
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();
  const button = cardForm.querySelector(".popup__button");
  button.textContent = "Создание...";
  addCard({
    name: cardNameInput.value,
    link: cardLinkInput.value,
  })
    .then((card) => {
      placesWrap.prepend(
        createCardElement(
          {
            name: cardNameInput.value,
            link: cardLinkInput.value,
          },
          {
            onPreviewPicture: handlePreviewPicture,
            onLikeIcon: (likeButton) =>
              handleLikeCard(
                likeButton,
                card._id,
                likeButton.classList.contains("card__like-button_is-active")
              ),
            onDeleteCard: (cardElement) =>
              handleDeleteCard(cardElement, card._id),
            onInfoCard: () => handleInfoClick(card._id),
          },
          currentUser_id
        )
      );

      closeModalWindow(cardFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    });
};

const handleDeleteCard = (cardElement, cardId) => {
  const confirmDeleteModal = document.querySelector(".popup_type_remove-card");
  if (confirmDeleteModal) {
    openModalWindow(confirmDeleteModal);
    const confirmButton = confirmDeleteModal.querySelector(".popup__button");
    confirmButton.addEventListener("click", () => {
      confirmButton.textContent = "Удаление...";
      deleteCardAPI(cardId)
        .then(() => {
          deleteCard(cardElement);
          closeModalWindow(confirmDeleteModal);
        })
        .catch((err) => {
          console.log(err);
        });
    });
  }
};

const handleLikeCard = (likeButton, cardId, isLiked) => {
  changeLikeCardStatus(cardId, isLiked)
    .then((updateCard) => {
      const likeCountElement =
        likeButton.parentElement.querySelector(".card__like-count");
      if (likeCountElement) {
        likeCountElement.textContent = updateCard.likes.length;
      }
      likeCard(likeButton);
    })
    .catch((err) => {
      console.log(err);
    });
};

const handleInfoClick = (cardId) => {
  /* Для вывода корректной информации необходимо получить актуальные данные с сервера. */
  getCardList()
    .then((cards) => {
      const cardData = cards.find((card) => card._id === cardId);
      const cardInfoModalWindow = document.querySelector(".popup_type_info");

      const cardInfoModalInfoList = cardInfoModalWindow.querySelector(".popup__content_content_info");

      const title = cardInfoModalInfoList.querySelector(".popup__title");
      title.textContent = "Информация о карточке";

      const text = cardInfoModalInfoList.querySelector(".popup__text");
      text.textContent = "Лайкнувшие пользователи:";

      const list = cardInfoModalInfoList.querySelector(".popup__list");
      list.innerHTML = "";
      list.append(...cardData.likes.map((like) => {
        const listItem = document.createElement("li");
        listItem.classList.add("popup__list-item", "popup__list-item_type_badge");
        listItem.textContent = like.name;
        return listItem;
      })); 
      cardInfoModalInfoList.innerHTML = ""; 
      cardInfoModalInfoList.append(
        title,
        createInfoString("Название:", cardData.name),
        createInfoString(
          "Дата создания:",
          formatDate(new Date(cardData.createdAt))
        )
        ,createInfoString(
          "Владелец:",
          cardData.owner ? cardData.owner.name : "Неизвестно"
        )
        ,createInfoString(
          "Количество лайков:",
          cardData.likes ? cardData.likes.length : 0
        )
        ,text
        ,list
      );
      openModalWindow(cardInfoModalWindow);
    })
    .catch((err) => {
      console.log(err);
    });
};

const createInfoString = (term, description) => {
  const infoItem = document.createElement("div");
  infoItem.classList.add("popup__info-item");
  infoItem.innerHTML = `<dt class="popup__info-term">${term}</dt><dd class="popup__info-description">${description}</dd>`;
  return infoItem;
};

// EventListeners
profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFromSubmit);

openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  openModalWindow(cardFormModalWindow);
});

//настраиваем обработчики закрытия попапов
const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

// Создание объекта с настройками валидации
const validationSettings = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
  // Разрешаем латинские и кириллические буквы, пробел и дефис
  regex: /^[A-Za-zА-Яа-яЁё\s-]+$/u,
};

// включение валидации вызовом enableValidation
// все настройки передаются при вызове
enableValidation(validationSettings);

function startApp() {
  Promise.all([getCardList(), getUserInfo()])
    .then(([cards, userData]) => {
      currentUser_id = userData._id;
      cards.forEach((card) => {
        placesWrap.append(
          createCardElement(
            card,
            {
              onPreviewPicture: handlePreviewPicture,
              onLikeIcon: (likeButton) =>
                handleLikeCard(
                  likeButton,
                  card._id,
                  likeButton.classList.contains("card__like-button_is-active")
                ),
              onDeleteCard: (cardElement) =>
                handleDeleteCard(cardElement, card._id),
              onInfoCard: () => handleInfoClick(card._id),
            },
            currentUser_id
          )
        );
        profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
        profileTitle.textContent = userData.name;
        profileDescription.textContent = userData.about;
      });
    })
    .catch((err) => {
      console.log(err);
    });
}
startApp();

// отображение карточек
// initialCards.forEach((data) => {
//   placesWrap.append(
//     createCardElement(data, {
//       onPreviewPicture: handlePreviewPicture,
//       onLikeIcon: likeCard,
//       onDeleteCard: deleteCard,
//     })
//   );
// });
