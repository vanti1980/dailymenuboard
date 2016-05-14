describe('App', () => {

  beforeEach(() => {
    browser.get('/');
  });


  it('should have a main tag', () => {
    let subject = element(by.css('app main')).isPresent();
    let result  = true;
    expect(subject).toEqual(result);
  });

});
