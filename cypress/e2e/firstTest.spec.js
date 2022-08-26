/// <reference types="cypress"/>



const { title } = require("process")

describe('Test with backend', () => {
    beforeEach('login to the app', () => {
        
        cy.intercept({method: 'GET', path: 'tags'}, {fixture:'tags.json'})
        cy.loginToApplication()
    })

    
    let title = 'This is a title of Ievgeniia article21'
   

    it('verify correct request and response', () => {

        
        cy.intercept({method: 'POST', url: 'https://api.realworld.io/api/articles/'}).as('postArticles')

        cy.contains('New Article').click()
        cy.get('[formcontrolname="title"]').type(title)
        cy.get('[formcontrolname="description"]').type('This is a description')
        cy.get('[formcontrolname="body"]').type('This is a body')
        cy.contains('Publish Article').click()

        cy.wait('@postArticles')
        cy.get('@postArticles').then( xhr => {
            console.log(xhr)
            expect(xhr.response.statusCode).to.equal(200)
            expect(xhr.request.body.article.body).to.equal('This is a body')
            expect(xhr.request.body.article.description).to.equal('This is a description')
        })
    })

    it('intercept and modify request and response', () => {

        
        // cy.intercept({method: 'POST', url: 'https://api.realworld.io/api/articles/'}, (req) => {
        //     req.body.article.description = "This is a description 2"
        // }).as('postArticles')

        cy.intercept({method: 'POST', url: 'https://api.realworld.io/api/articles/'}, (req) => {
            req.reply(res => {
                expect(res.body.article.description).to.equal('This is a description')
                res.body.article.description = "This is a description 2"
            })
        }).as('postArticles')

        cy.contains('New Article').click()
        cy.get('[formcontrolname="title"]').type(title)
        cy.get('[formcontrolname="description"]').type('This is a description')
        cy.get('[formcontrolname="body"]').type('This is a body')
        cy.contains('Publish Article').click()

        cy.wait('@postArticles')
        cy.get('@postArticles').then( xhr => {
            console.log(xhr)
            expect(xhr.response.statusCode).to.equal(200)
            expect(xhr.request.body.article.body).to.equal('This is a body')
            expect(xhr.request.body.article.description).to.equal('This is a description')
        })
    })

    it('should give tags with routing object', () => {
        cy.get('.tag-list')
        .should('contain', 'implementations')
        .and('contain', 'welcome')
        .and('contain', 'introduction')
    })

    it('verify global feed likes count', () => {
        cy.intercept('GET', '**/articles/feed*', {"articles":[],"articlesCount":0})
        cy.intercept('GET', '**/articles*', {fixture:'articles.json'})

        cy.contains('Global Feed').click()
        cy.get('app-article-list button').then( listOfbuttons => {
            expect(listOfbuttons[0]).to.contain('1')
            expect(listOfbuttons[1]).to.contain('5')
        }) 

        cy.fixture('articles').then( file => {
            const articleLink = file.articles[1].slug
            cy.intercept('POST', '**/articles/'+articleLink+'/favorite', file)
        })  
    
        cy.get('app-article-list button')
        .eq(1)
        .click()
        .should('contain', '6')
    })

    
}) 