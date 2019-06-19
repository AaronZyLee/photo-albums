const selectors = {
    signInUsernameInput: '[data-test="username-input"]',
    signInPasswordInput: '[data-test="sign-in-password-input"]',
    signInSignInButton: '[data-test="sign-in-sign-in-button"]',
    signInCreateAccountLink: '[data-test="sign-in-create-account-link"]',
    signInForgotPasswordLink: '[data-test="sign-in-forgot-password-link"]',
    verifyContactSkipLink: '[data-test="verify-contact-skip-link"]'
  };
  
  const COGNITO_SIGN_IN_USERNAME = Cypress.env('COGNITO_SIGN_IN_USERNAME');
  const COGNITO_SIGN_IN_PASSWORD = Cypress.env('COGNITO_SIGN_IN_PASSWORD');
  const COGNITO_SIGN_IN_EMAIL = Cypress.env('COGNITO_SIGN_IN_EMAIL');
  const COGNITO_SIGN_IN_PHONE_NUMBER = Cypress.env('COGNITO_SIGN_IN_PHONE_NUMBER');
  
  // Used for signing in for cypress integ tests
  const login = () => {
    cy.get(selectors.signInUsernameInput).type(COGNITO_SIGN_IN_USERNAME);
    cy.get(selectors.signInPasswordInput).type(COGNITO_SIGN_IN_PASSWORD);
    cy.get(selectors.signInSignInButton).contains('Sign In').click();
    cy.get(selectors.verifyContactSkipLink).contains('Skip').click();
  };
  
  // Used as a common invalid username for sigining in for cypress integ tests
  const loginErrorInvalidUsername = () => {
    cy.get(selectors.signInUsernameInput).type('InvalidUsername');
    cy.get(selectors.signInSignInButton).contains('Sign In').click();
    cy.get('div').contains('User does not exist');
  };
  
  // Used as a common invalid password for sigining in for cypress integ tests
  const loginErrorInvalidPassword = () => {
    cy.get(selectors.signInUsernameInput).type(COGNITO_SIGN_IN_USERNAME);
    cy.get(selectors.signInPasswordInput).type('InvalidPassword');
    cy.get(selectors.signInSignInButton).contains('Sign In').click();
    cy.get('div').contains('Incorrect username or password');
  };
  
  const createAccountLink = () => {
    cy.get(selectors.signInCreateAccountLink).click();
  };
  
  const createAccountAction = () => {
    cy.get('input[placeholder="Username"]').type(COGNITO_SIGN_IN_USERNAME);
    cy.get('input[placeholder="Password"]').type(COGNITO_SIGN_IN_PASSWORD);
    cy.get('input[placeholder="Email"]').type(COGNITO_SIGN_IN_EMAIL);
    cy.get('input[placeholder="Phone Number"]').type(COGNITO_SIGN_IN_PHONE_NUMBER);
  };
  
  const resetPassword = () => {
    cy.get(selectors.signInForgotPasswordLink).click();
  };
  
  
  export {
    login,
    loginErrorInvalidUsername,
    loginErrorInvalidPassword,
    createAccountLink,
    createAccountAction,
    resetPassword
  };
  