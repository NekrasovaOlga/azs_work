import {Column} from './column';
import {RenderStation} from './renderStation';

export class Station {
  #queue = [];
  #filling = [];
  #ready = [];

  constructor(typeStation, renderApp = null) {
    this.typeStation = typeStation;
    this.renderApp = renderApp;
    this.RenderStation = null;
  }

  get filling() {
    return this.#filling;
  }

  get queue() {
    return this.#queue;
  }

  renderStationApp(renderApp) {
    this.RenderStation = renderApp ? new RenderStation(renderApp, this) : null;
  }

  renderColumn(typeStation) {
    for (const optionStation of typeStation) {
      optionStation.count = !optionStation.count ? 1 : optionStation.count;
      for (let i = 0; i < optionStation.count; i++) {
        this.#filling.push(new Column(optionStation.type, optionStation.speed));
      }
    }
  }

  init() {
    this.renderColumn(this.typeStation);
    this.renderStationApp(this.renderApp);

    setInterval(() => {
      this.chechQueueToFilling();
    }, 2000);
  }

  chechQueueToFilling() {
    if (this.#queue.length) {
      for (let i = 0; i < this.#queue.length; i++) {
        for (let j = 0; j < this.#filling.length; j++) {
          if (
            !this.#filling.car &&
            this.#queue[i].typeFuel === this.#filling[j].type
          ) {
            this.#filling[j].car = this.#queue.splice(i, 1)[0];
            this.fillingGo(this.#filling[j]);
            this.RenderStation.renderStation();
            break;
          }
        }
      }
    }
  }

  fillingGo(column) {
    const car = column.car;
    const start = car.needPetrol;
    let nowTank = car.nowTank;
    const timerId = setInterval(() => {
      nowTank += column.speed;
      if (nowTank >= car.maxTank) {
        clearInterval(timerId);
        const total = car.nowTank - start;
        car.fillUp();
        column.car = null;
        this.leaveClient({car, total});
      }
    }, 1000);
  }

  leaveClient({car, total}) {
    this.#ready.push(car);
    this.RenderStation.renderStation();
  }

  addCarQueue(car) {
    this.#queue.push(car);
    this.RenderStation.renderStation();
  }
}
