const Modal = {
    open() {
        // abrir modal
        // adicionar a classe active ao modal
        document.querySelector('.modal-overlay')
                .classList
                .add('active');
    },
    close () {
        // fechar o modal
        // remover a classe active ao modal
        document.querySelector('div.active')
                .classList
                .remove('active');

        Form.clearFields();
    }
};
const Storage =  {
    tName: 'dev.finances:transactions',
    get(){
        return JSON.parse(localStorage.getItem(Storage.tName)) || [];
    },
    set(transactions) {
        localStorage.setItem(Storage.tName, JSON.stringify(transactions));
    }
}

const Transactions = {
    all: Storage.get(),
    add(transaction){
        Transactions.all.push(transaction);
        App.reload();
    },
    remove(index) {
        Transactions.all.splice(index, 1);
        App.reload();
    }
    ,
    incomes() {
        // somar as entradas
        let income = 0;
        Transactions.all.forEach(transaction => {
            if (transaction.amount > 0) {
                income +=  transaction.amount;

            }
        })
        return income; 
    },
    expenses() {
        // somar as saídas
        let expense = 0;
        Transactions.all.forEach(transaction => {
            if (transaction.amount < 0) {
                expense +=  transaction.amount;

            }
        })
        return expense; 
    },
    total() {
        
        return Transactions.incomes()+ Transactions.expenses();
    },

};

// Substituir os dados do HTML por dados do JS
const DOM = {
    transactionsContainer:document.querySelector("#data-table tbody"),
    addTransaction(transaction, index) {
        const tr = document.createElement('tr');
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
        tr.dataset.index = index;
        DOM.transactionsContainer.appendChild(tr);

    },

    innerHTMLTransaction(transaction, index) {
        const CssClass = (transaction.amount >0) ? 'income' : 'expense';
        const amount = Utils.createCurrencyTag(transaction.amount);

        const html = `
            <td class="description">${transaction.description}</td>
            <td class="${CssClass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td><img onclick="Transactions.remove(${index})" src="./assets/minus.svg" alt="Remover transação"></td>
        `;
        return html;
    },
    
    updateBalance(){
        document
            .getElementById("incomeDisplay")
            .innerHTML = Utils.createCurrencyTag(Transactions.incomes());
        
        document
            .getElementById("expenseDisplay")
            .innerHTML = Utils.createCurrencyTag(Transactions.expenses());

        document
            .getElementById("totalDisplay")
            .innerHTML = Utils.createCurrencyTag(Transactions.total());
        
            document.querySelector('.card.total').style.backgroundColor = (Transactions.total() < 0) 
                                                                            ? 'var(--red)' 
                                                                            : "var(--green)";
        
    },
    clearTransactions(){
        this.transactionsContainer.innerHTML = '';
    },
}
const Utils =  {
    formatCurrency(value) {
        const signal = Number(value) < 0 ? '-' : '';
        
        value = String(value).replace(/\D/g, '');
        
        value = Number(value)/100;

        
        value = value.toLocaleString('pt-BR', {
            style:'currency',
            currency:'MZN' // BRL => real | MZN => Metical
        });
        
        return signal + value;
        
        
        // console.log();
    },
    formatCurrencyShort (num) {
        // fonte: https://idleminertycoon.fandom.com/wiki/Currency_Display
        const signal = Number(num) < 0 ? '-' : '';
        num = (signal === '-') ? -Number(num) : Number(num);
        num = Number(num) / 100;
        let res  = num; 
        const K  = [10 ** 3,   'K'];   // Mil
        const M  = [10 ** 6,   'M'];   // Milhão
        const B  = [10 ** 9,   'B'];   // Bilhão
        const T  = [10 ** 12,  'T'];   // Trilhão
        const AA = [10 ** 15, 'aa'];   // Quadrilhão
        const AB = [10 ** 18, 'ab'];   // Quintilhão
        const AC = [10 ** 21, 'ac'];   // Sextilhão
        const representation = [AC, AB, AA, T, B, M, K];
    
       for (let i = 0; i < representation.length; i++) {
            if (num / representation[i][0] >= 1) {
                res = +(num / representation[i][0]).toFixed(2) + representation[i][1];
                break;
            }
        }
    
        return signal + 'MZN ' + res;
    },
    createCurrencyTag(value) {
        let amount;
        if (value > 10 ** 9 || value < -(10 ** 9)) {
            amount =  Utils.formatCurrencyShort(value);
            amount =  `<abbr tabindex="0" title="${Utils.formatCurrency(value)}">${amount}</abbr>`;
        } else {
            amount = Utils.formatCurrency(value); 
            amount =  `<abbr tabindex="0" title="${amount}">${amount}</abbr>`;

        }
        return amount;
    }
    ,
    
    formatAmount(value) {
        value = Number(value.replace(/\.\,/g), "") * 100;
        return value; 
    },

    formatDate(value){
        const splittedDate = value.split('-');
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),
    getValues(){
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value,
        }
    },
    validadeFields(){
            const {description, amount, date} = Form.getValues();
            if (description.trim() === '' || amount.trim() === '' || date.trim() === '') {
                throw new Error("Por favor, preencha todos os campos");
            }

    },
    formatValues(){
        let {description, amount, date} = Form.getValues();

        amount = Utils.formatAmount(amount);
        date = Utils.formatDate(date);

        return {
            description,
            amount,
            date,
        }
    },
    clearFields(){
        Form.description.value = '';
        Form.amount.value = '';
        Form.date.value = '';
    }
    ,
    submit(event) {
        event.preventDefault();
        try {
            Form.validadeFields();
            const transaction = Form.formatValues();
            Transactions.add(transaction);
            Form.clearFields();
            Modal.close();
            
        } catch (error) {
            alert(error.message)
        }

    }
}


const App = {
    init(){
        
        Transactions.all.forEach(
            DOM.addTransaction
            )
            DOM.updateBalance();
            Storage.set(Transactions.all)
    },
    reload() {
        DOM.clearTransactions();
        App.init();
    }
}
App.init();
