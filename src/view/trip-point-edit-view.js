import {capitalize, toFullDateTime} from '../utils';
import AbstractView from '../framework/view/abstract-view';

const BLANK_POINT =
  {
    basePrice: 0,
    destination: {
      description: '',
      name: '',
      pictures: []
    },
    dateFrom: '',
    dateTo: '',
    isFavorite: false,
    offers: [],
    type: 'taxi'
  };

function createEventTypesTemplate() {
  const types = ['taxi', 'bus', 'train', 'ship', 'drive', 'flight', 'check-in', 'sightseeing', 'restaurant'];
  let result = '';

  for (const type of types) {
    result += (
      `<div class="event__type-item">
        <input id="event-type-${type}-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="${type}">
        <label class="event__type-label  event__type-label--${type}" for="event-type-${type}-1">${capitalize(type)}</label>
      </div>`
    );
  }

  return result;
}

function createPhotosTemplate(photos) {
  let result = '';
  if (!photos) {
    return result;
  }

  for (const photo of photos) {
    result += `<img class="event__photo" src="${photo.src}" alt="${photo.description}">`;
  }

  return result;
}

function createDestinationTemplate(destination) {
  if (!destination) {
    return '';
  }

  const photosTemplate = createPhotosTemplate(destination.pictures);

  return (
    `<section class="event__section  event__section--destination">
      <h3 class="event__section-title  event__section-title--destination">Destination</h3>
      <p class="event__destination-description">${destination.description}</p>

      <div class="event__photos-container">
        <div class="event__photos-tape">
            ${photosTemplate}
        </div>
      </div>
    </section>`
  );
}

function createOfferTemplate(offer) {
  return (
    `<div class="event__offer-selector">
      <input class="event__offer-checkbox  visually-hidden" id="${offer.id}" type="checkbox" name="event-offer-luggage" checked>
      <label class="event__offer-label" for="${offer.id}">
        <span class="event__offer-title">${offer.title}</span>
        &plus;&euro;&nbsp;
        <span class="event__offer-price">${offer.price}</span>
      </label>
    </div>`
  );
}

function createOffersTemplate(offers) {
  if (!offers || offers.length === 0) {
    return '';
  }

  let result = `
    <section class="event__section  event__section--offers">
      <h3 class="event__section-title  event__section-title--offers">Offers</h3>
        <div class="event__available-offers">`;

  for (const offer of offers) {
    result += createOfferTemplate(offer);
  }

  result += '</div></section>';
  return result;
}

function createTripPointEditTemplate(tripPoint, idToDestinationMap, idToOfferMap) {
  const startDateTime = toFullDateTime(tripPoint.dateFrom);
  const endDateTime = toFullDateTime(tripPoint.dateTo);
  const destination = idToDestinationMap.get(tripPoint.destination);
  const destinationTemplate = createDestinationTemplate(destination);
  const offersTemplate = createOffersTemplate(tripPoint.offers.map((offer) => idToOfferMap.get(offer)));
  const eventTypesTemplate = createEventTypesTemplate();

  return (
    `<li class="trip-events__item">
      <form class="event event--edit" action="#" method="post">
        <header class="event__header">
          <div class="event__type-wrapper">
            <label class="event__type  event__type-btn" for="event-type-toggle-1">
              <span class="visually-hidden">Choose event type</span>
              <img class="event__type-icon" width="17" height="17" src="img/icons/${tripPoint.type}.png" alt="Event type icon">
            </label>
            <input class="event__type-toggle  visually-hidden" id="event-type-toggle-1" type="checkbox">

            <div class="event__type-list">
              <fieldset class="event__type-group">
                <legend class="visually-hidden">Event type</legend>
                ${eventTypesTemplate}
              </fieldset>
            </div>
          </div>

          <div class="event__field-group  event__field-group--destination">
            <label class="event__label  event__type-output" for="event-destination-1">
              ${capitalize(tripPoint.type)}
            </label>
            <input class="event__input  event__input--destination" id="event-destination-1" type="text" name="event-destination" value="${destination.name}" list="destination-list-1">
            <datalist id="destination-list-1">
              <option value="Amsterdam"></option>
              <option value="Geneva"></option>
              <option value="Chamonix"></option>
            </datalist>
          </div>

          <div class="event__field-group  event__field-group--time">
            <label class="visually-hidden" for="event-start-time-1">From</label>
            <input class="event__input  event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="${startDateTime}">
            &mdash;
            <label class="visually-hidden" for="event-end-time-1">To</label>
            <input class="event__input  event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="${endDateTime}">
          </div>

          <div class="event__field-group  event__field-group--price">
            <label class="event__label" for="event-price-1">
              <span class="visually-hidden">Price</span>
              &euro;
            </label>
            <input class="event__input  event__input--price" id="event-price-1" type="text" name="event-price" value="${tripPoint.basePrice}">
          </div>

          <button class="event__save-btn  btn  btn--blue" type="submit">Save</button>
          <button class="event__reset-btn" type="reset">Delete</button>
          <button class="event__rollup-btn" type="button">
            <span class="visually-hidden">Open event</span>
          </button>
        </header>
        <section class="event__details">
          ${offersTemplate}
          ${destinationTemplate}
        </section>
      </form>
    </li>`
  );
}

export default class TripPointEditView extends AbstractView {
  #tripPoint;
  #idToDestinationMap;
  #idToOfferMap;

  #handleRollupClick;
  #handleFormSubmit;

  constructor({
    tripPoint = BLANK_POINT, idToDestinationMap, idToOfferMap, onRollupClick, onFormSubmit
  }) {
    super();
    this.#tripPoint = tripPoint;
    this.#idToDestinationMap = idToDestinationMap;
    this.#idToOfferMap = idToOfferMap;

    this.#handleRollupClick = onRollupClick;
    this.#handleFormSubmit = onFormSubmit;

    this.element.querySelector('.event__rollup-btn')
      .addEventListener('click', this.#rollupClickHandler);

    this.element.querySelector('form')
      .addEventListener('submit', this.#formSubmitHandler);
  }

  get template() {
    return createTripPointEditTemplate(this.#tripPoint, this.#idToDestinationMap, this.#idToOfferMap);
  }

  #rollupClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleRollupClick();
  };

  #formSubmitHandler = (evt) => {
    evt.preventDefault();
    this.#handleFormSubmit();
  };
}
