import render from './Render'

const fields = [
    {key: 'hp', label: '血量', type: 'status', defaultValue: 100},
    {key: 'attack', label: '攻击', type: 'status', defaultValue: 10},
    {key: 'defense', label: '防御', type: 'status', defaultValue: 10},
    {key: 'money', label: '金币', type: 'status', defaultValue: 10},
    {key: 'yellowkey', label: '黄钥匙', type: 'item', defaultValue: 1},
    {key: 'bluekey', label: '蓝钥匙', type: 'item', defaultValue: 1},
    {key: 'redkey', label: '红钥匙', type: 'item', defaultValue: 1}
]

class Cheat{
    constructor() {
        this.game = null
        this.inited = false
        this.resumeRunning = false
        this.panel = null
        this.fieldWrap = null
    }
    init(game) {
        this.game = game
        if( this.inited ) {
            this.sync()
            return
        }
        this.panel = document.getElementById('cheat-panel')
        this.fieldWrap = document.getElementById('cheat-fields')
        this.fieldWrap.innerHTML = fields.map(field => `
            <div class="cheat-row" data-key="${field.key}" data-type="${field.type}">
                <div class="cheat-label">${field.label}</div>
                <div class="cheat-current">0</div>
                <input class="cheat-input" type="number" value="${field.defaultValue}" />
                <div class="cheat-actions">
                    <button class="cheat-action" data-action="decrease">减</button>
                    <button class="cheat-action" data-action="increase">加</button>
                    <button class="cheat-action" data-action="set">设</button>
                </div>
            </div>
        `).join('')

        document.getElementById('cheat-btn').onclick = () => {
            this.open()
        }
        document.getElementById('cheat-close').onclick = () => {
            this.close()
        }
        document.getElementById('cheat-reset').onclick = () => {
            this.resetInputs()
        }
        this.panel.onclick = ev => {
            if( ev.target === this.panel ) {
                this.close()
            }
        }
        this.fieldWrap.onclick = ev => {
            let button = ev.target.closest('.cheat-action')
            if( !button ) {
                return
            }
            let row = button.closest('.cheat-row')
            let field = fields.find(item => item.key === row.dataset.key)
            if( !field ) {
                return
            }
            let action = button.dataset.action
            if( action === 'increase' ) {
                this.changeValue(field, row, 1)
            } else if( action === 'decrease' ) {
                this.changeValue(field, row, -1)
            } else if( action === 'set' ) {
                this.setValue(field, row)
            }
        }
        this.inited = true
        this.sync()
    }
    getCurrent(field) {
        if( field.type === 'item' ) {
            return this.game.player.items[field.key]
        }
        return this.game.player[field.key]
    }
    normalizeValue(value) {
        if( !Number.isFinite(value) ) {
            return 0
        }
        return Math.max(0, parseInt(value, 10) || 0)
    }
    getInputValue(field, row) {
        let input = row.querySelector('.cheat-input')
        let value = parseInt(input.value, 10)
        if( Number.isFinite(value) ) {
            return value
        }
        input.value = field.defaultValue
        return field.defaultValue
    }
    writeValue(field, value) {
        let nextValue = this.normalizeValue(value)
        if( field.type === 'item' ) {
            this.game.player.items[field.key] = nextValue
        } else {
            this.game.player[field.key] = nextValue
        }
        render.status(this.game.player)
        render.keys(this.game.player)
        this.syncField(field)
    }
    changeValue(field, row, direction) {
        let amount = Math.abs(this.getInputValue(field, row))
        let current = this.getCurrent(field)
        this.writeValue(field, current + direction * amount)
    }
    setValue(field, row) {
        let target = this.getInputValue(field, row)
        this.writeValue(field, target)
    }
    syncField(field) {
        let row = this.fieldWrap.querySelector(`[data-key="${field.key}"]`)
        if( !row ) {
            return
        }
        row.querySelector('.cheat-current').innerText = this.getCurrent(field)
    }
    sync() {
        if( !this.inited ) {
            return
        }
        fields.forEach(field => this.syncField(field))
    }
    resetInputs() {
        fields.forEach(field => {
            let row = this.fieldWrap.querySelector(`[data-key="${field.key}"]`)
            if( row ) {
                row.querySelector('.cheat-input').value = field.defaultValue
            }
        })
        this.sync()
    }
    isOpen() {
        return !!this.panel && getComputedStyle(this.panel).visibility === 'visible'
    }
    open() {
        this.resumeRunning = this.game.running
        this.game.pause()
        this.sync()
        this.panel.style.visibility = 'visible'
    }
    close() {
        this.panel.style.visibility = 'hidden'
        if( this.resumeRunning ) {
            this.game.start()
        }
        this.resumeRunning = false
    }
}

export default new Cheat()
