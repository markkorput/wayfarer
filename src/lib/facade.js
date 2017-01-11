class Facade {
  constructor(Model) {
    this.Model = Model;
  }

  create(input) {
    const model = new this.Model(input);
    return model.save();
  }

  update(conditions, update) {
    return this.Model
    .update(conditions, update, { new: true })
    .exec();
  }

  find(query) {
    return this.Model
    .find(query)
    .exec();
  }

  findOne(query) {
    return this.Model
    .findOne(query)
    .exec();
  }

  findById(id) {
    return this.Model
    .findById(id)
    .exec();
  }

  remove(id) {
    return this.Model
    .findByIdAndRemove(id)
    .exec();
  }
}

module.exports = Facade;
