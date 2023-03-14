const {sqlForPartialUpdate} = require('./sql');

test('output is as expected with two parameters', () => {
    const output = sqlForPartialUpdate({firstName:'Bob', lastName:'Marley'}, {firstName:'first_name', lastName:'last_name'});

    expect(output).toEqual({
        setCols:`"first_name"=$1, "last_name"=$2`,
        values:['Bob','Marley']
    })
})

test('output is as expected with four parameters', () => {
    const output = sqlForPartialUpdate(
        {firstName:'Bob', lastName:'Marley', famousFor:'music', genre:'reggae'}, 
        {firstName:'first_name', lastName:'last_name', famousFor:'famous_for', genre:'genre'});

    expect(output).toEqual({
        setCols:`"first_name"=$1, "last_name"=$2, "famous_for"=$3, "genre"=$4`, 
        values:['Bob','Marley','music','reggae']
    })
})

test('you can leave off some values if they don\'t need to be renamed for sql', () => {
    const output = sqlForPartialUpdate(
        {firstName:'Bob', lastName:'Marley', famousFor:'music', genre:'reggae'}, 
        {firstName:'first_name', lastName:'last_name', famousFor:'famous_for'});

    expect(output).toEqual({
        setCols:`"first_name"=$1, "last_name"=$2, "famous_for"=$3, "genre"=$4`, 
        values:['Bob','Marley','music','reggae']
    })
})