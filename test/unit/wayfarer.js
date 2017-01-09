import wayfarer from '../../src/wayfarer';

describe('wayfarer', () => {
  describe('Greet function', () => {
    beforeEach(() => {
      spy(wayfarer, 'greet');
      wayfarer.greet();
    });

    it('should have been run once', () => {
      expect(wayfarer.greet).to.have.been.calledOnce;
    });

    it('should have always returned hello', () => {
      expect(wayfarer.greet).to.have.always.returned('hello');
    });
  });
});
