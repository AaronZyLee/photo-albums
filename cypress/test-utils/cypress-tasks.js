import {selectors} from './selectors'
  
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

  const createAccountWithMissingValue = () => {
    cy.get('input[placeholder="Username"]').type(COGNITO_SIGN_IN_USERNAME);
    cy.get('input[placeholder="Email"]').type(COGNITO_SIGN_IN_EMAIL);
    cy.get('input[placeholder="Phone Number"]').type(COGNITO_SIGN_IN_PHONE_NUMBER);
  };

const createAccountWithInvalidPasswordFormat = () => {
  cy.get('input[placeholder="Username"]').type(COGNITO_SIGN_IN_USERNAME);
  cy.get('input[placeholder="Password"]').type('test');
  cy.get('input[placeholder="Email"]').type(COGNITO_SIGN_IN_EMAIL);
  cy.get('input[placeholder="Phone Number"]').type(COGNITO_SIGN_IN_PHONE_NUMBER);
}
  
  const resetPassword = () => {
    cy.get(selectors.signInForgotPasswordLink).click();
  };

  const uploadFile = () => {
    cy.fixture('images/demo.jpg', 'base64').then(fileContent => {
        cy.get('input[type="file"]').upload({fileContent, fileName:'test.jpg', mimeType: 'image/png'},{subjectType:'input'});                   
    });
    cy.wait('@upload');
    cy.get('@upload').then(xhr => {
        expect(xhr.method).to.eq('PUT');
        expect(xhr.status).to.eq(200);
    });
  }

  const downloadFile = () => {
    cy.get('.ui img').should('have.attr','src').then((src) => {
        cy.request(src).then(response => {
            expect(response.status).to.eq(200)
        })
    });
  }

  const createAlbum = (album) => {
    cy.get('input[type="text"]').type(album);
    cy.get('button').contains('Create').click();
    cy.wait(2000);
    cy.reload();
    cy.get(selectors.albumList).contains(album);
  };
  
  
  export {
    login,
    loginErrorInvalidUsername,
    loginErrorInvalidPassword,
    createAccountLink,
    createAccountAction,
    createAccountWithMissingValue,
    createAccountWithInvalidPasswordFormat,
    resetPassword,
    uploadFile,
    downloadFile,
    createAlbum
  };
  