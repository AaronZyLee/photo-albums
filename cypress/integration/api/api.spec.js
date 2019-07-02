import { login } from "../../test-utils/cypress-tasks";

describe('API test:', () => {

    beforeEach(() => {
        cy.visit('/');
        login();

        cy.server();
        cy.route('POST', '/graphql').as('graphql');
    });

    afterEach(() => {
        cy.visit('/');
        cy.get('[data-test="deleteAll"]').click()
        cy.wait(2000);
        cy.get('[data-test="album"]').find('div[role="listitem"] a').should('not.exist');
    });

    describe('CRUD Operations:', () => {
        it('should create a new album', () => {
            cy.get('input[type="text"]').type('First Album');
            cy.get('button').contains('Create').click();
            cy.wait(2000);
            cy.reload();
            cy.get('div[role="listitem"]').contains('First Album');
        });

        it('should retrieve albums from dynamicDB and list all albums', () => {
            cy.get('input[type="text"]').type('First Album');
            cy.get('button').contains('Create').click();
            cy.wait(2000);
            cy.reload();
            cy.get('div[role="listitem"]').contains('First Album');

            cy.get('input[type="text"]').clear().type('Second Album');
            cy.get('button').contains('Create').click();
            cy.wait(2000);
            cy.reload();
            cy.get('div[role="listitem"]').contains('Second Album');


            cy.get('input[type="text"]').clear().type('Third Album');
            cy.get('button').contains('Create').click();
            cy.wait(2000);
            cy.reload();
            cy.get('div[role="listitem"]').contains('Third Album');



            cy.get('div[role="listitem"] a').should('have.attr', 'href');
        });

        it('should update a album infomation', () => {
            cy.get('input[type="text"]').type('First Album');
            cy.get('button').contains('Create').click();
            cy.wait(2000);
            cy.reload();

            cy.get('div[role="listitem"] a').click();
            cy.get('input[type="text"]').type('Amplify');
            cy.get('button').contains('Update').click();
            cy.wait('@graphql');
            cy.get('@graphql').then(xhr => {
                expect(xhr.status).to.eq(200);
                cy.get('div[data-test="backToAlbum"] a').click();
                cy.get('div[role="listitem"]').contains('Amplify');
            });
            
        });

        it('should delete an existing album', () => {
            cy.get('input[type="text"]').type('First Album');
            cy.get('button').contains('Create').click();

            cy.wait(2000);
            cy.reload();

            cy.get('div[role="listitem"] a').first().click();
            cy.get('input[type="text"]');
            cy.get('button').contains('Delete Album').click();
            cy.wait('@graphql');
            cy.get('@graphql').then(xhr => {
                expect(xhr.status).to.eq(200)
            });
            cy.get('[data-test="album"]').find('div[role="listitem"] a').should('not.exist');
        });
    });
    
});