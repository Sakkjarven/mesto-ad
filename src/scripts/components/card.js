export const likeCard = (likeButton) => {
  likeButton.classList.toggle("card__like-button_is-active");
};

export const deleteCard = (cardElement) => {
  cardElement.remove();
};

const getTemplateInfo = () => {
  return document
    .getElementById("popup-info-definition-template")
    .content.querySelector(".popup")
    .cloneNode(true);
};
const getTemplate = () => {
  return document
    .getElementById("card-template")
    .content.querySelector(".card")
    .cloneNode(true);
};

export const createCardElement = (
  data,
  { onPreviewPicture, onLikeIcon, onDeleteCard, onInfoCard },
  currentUser_id = null
) => {
  const cardElement = getTemplate();
  const likeButton = cardElement.querySelector(".card__like-button");
  const deleteButton = cardElement.querySelector(
    ".card__control-button_type_delete"
  );
  const infoButton = cardElement.querySelector(
    ".card__control-button_type_info"
  );

  const cardImage = cardElement.querySelector(".card__image");

  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardElement.querySelector(".card__title").textContent = data.name;

  if (data.owner && data.owner._id !== currentUser_id) {
    deleteButton.style.display = "none";
  }

  if (onDeleteCard) {
    deleteButton.addEventListener("click", () => onDeleteCard(cardElement));
  }

  if (onLikeIcon) {
    const likes = Array.isArray(data.likes) ? data.likes : [];
    likeButton.classList.toggle(
      "card__like-button_is-active",
      likes.some((like) => like._id === currentUser_id)
    );
    const likeCountElement =
      likeButton.parentElement.querySelector(".card__like-count");
    if (likeCountElement) {
      likeCountElement.textContent = likes.length;
    }
    likeButton.addEventListener("click", () => onLikeIcon(likeButton));
  }

  if (onPreviewPicture) {
    cardImage.addEventListener("click", () =>
      onPreviewPicture({ name: data.name, link: data.link })
    );
  }

  if (onInfoCard) {
    infoButton.addEventListener("click", () => onInfoCard(data._id));
  }

  return cardElement;
};
