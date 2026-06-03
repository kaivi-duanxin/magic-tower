function isEditableTarget(target) {
    if( !target ) {
        return false
    }
    let tagName = target.tagName
    return tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT' || target.isContentEditable
}

class Hotkeys{
    init(option) {
        this.game = option.game
        this.actions = option.actions
        this.handleKeydown = this.handleKeydown.bind(this)
        window.addEventListener('keydown', this.handleKeydown)
    }
    click(id) {
        let node = document.getElementById(id)
        if( node ) {
            node.click()
        }
    }
    isVisible(id) {
        let node = document.getElementById(id)
        return !!node && getComputedStyle(node).visibility === 'visible'
    }
    isMenuOpen() {
        return this.actions.isMenuOpen()
    }
    isMonsterBookOpen() {
        return this.actions.isMonsterBookOpen()
    }
    getFloorOptions() {
        return Array.from(document.querySelectorAll('#floor-list li'))
    }
    getFloorSelection() {
        let list = this.getFloorOptions()
        let current = list.find(node => node.classList.contains('selected'))
        if( current ) {
            return current
        }
        current = list.find(node => node.classList.contains('active')) || list[0]
        if( current ) {
            current.classList.add('selected')
        }
        return current
    }
    moveFloorSelection(direction) {
        let list = this.getFloorOptions()
        if( !list.length ) {
            return
        }
        let current = this.getFloorSelection()
        let currentIndex = Math.max(0, list.indexOf(current))
        let nextIndex = currentIndex + direction
        nextIndex = Math.max(0, Math.min(list.length - 1, nextIndex))
        if( current ) {
            current.classList.remove('selected')
        }
        let next = list[nextIndex]
        if( next ) {
            next.classList.add('selected')
            next.scrollIntoView({
                block: 'nearest',
                inline: 'nearest'
            })
        }
    }
    triggerFloorSelection() {
        let current = this.getFloorSelection()
        if( current ) {
            current.click()
        }
    }
    scrollMonsterBook(step) {
        let list = document.getElementById('monster-list')
        if( list ) {
            list.scrollBy(0, step)
        }
    }
    advanceDialog() {
        let dialog = document.getElementById('dialog')
        dialog.dispatchEvent(new Event('touchend'))
    }
    handleKeydown(ev) {
        let key = ev.key.toLowerCase()
        let editable = isEditableTarget(ev.target)

        if( this.isVisible('dialog') ) {
            if( editable ) {
                return
            }
            if( key === 'enter' || key === ' ' || key === 'spacebar') {
                ev.preventDefault()
                this.advanceDialog()
            }
            return
        }

        if( this.isVisible('confirm') ) {
            if( key === 'enter' || key === ' ' || key === 'spacebar') {
                ev.preventDefault()
                this.click('confirm-ok')
            } else if( key === 'escape' ) {
                ev.preventDefault()
                this.click('confirm-cancel')
            }
            return
        }

        if( this.isVisible('shop') ) {
            if( editable && key !== 'escape' ) {
                return
            }
            if( key === '1' ) {
                ev.preventDefault()
                this.click('add-hp')
            } else if( key === '2' ) {
                ev.preventDefault()
                this.click('add-attack')
            } else if( key === '3' ) {
                ev.preventDefault()
                this.click('add-defense')
            } else if( key === '4' || key === 'escape' ) {
                ev.preventDefault()
                this.click('close-shop')
            }
            return
        }

        if( this.actions.isCheatOpen() ) {
            if( key === 'escape' || key === 'g' ) {
                ev.preventDefault()
                this.actions.closeCheat()
                return
            }
            if( key === 'enter' ) {
                let row = ev.target && ev.target.closest ? ev.target.closest('.cheat-row') : null
                if( row ) {
                    ev.preventDefault()
                    let button = row.querySelector('[data-action="set"]')
                    if( button ) {
                        button.click()
                    }
                }
            }
            return
        }

        if( this.actions.isFloorOpen() ) {
            if( key === 'w' || key === 'arrowup' ) {
                ev.preventDefault()
                this.moveFloorSelection(-1)
            } else if( key === 's' || key === 'arrowdown' ) {
                ev.preventDefault()
                this.moveFloorSelection(1)
            } else if( key === 'home' ) {
                ev.preventDefault()
                this.moveFloorSelection(-9999)
            } else if( key === 'end' ) {
                ev.preventDefault()
                this.moveFloorSelection(9999)
            } else if( key === 'enter' || key === ' ' || key === 'spacebar') {
                ev.preventDefault()
                this.triggerFloorSelection()
            } else if( key === 'escape' || key === 't' ) {
                ev.preventDefault()
                this.actions.closeFloor()
            }
            return
        }

        if( this.actions.isMonsterBookOpen() ) {
            if( key === 'w' || key === 'arrowup' ) {
                ev.preventDefault()
                this.scrollMonsterBook(-120)
            } else if( key === 's' || key === 'arrowdown' ) {
                ev.preventDefault()
                this.scrollMonsterBook(120)
            } else if( key === 'pageup' ) {
                ev.preventDefault()
                this.scrollMonsterBook(-280)
            } else if( key === 'pagedown' ) {
                ev.preventDefault()
                this.scrollMonsterBook(280)
            } else if( key === 'home' ) {
                ev.preventDefault()
                document.getElementById('monster-list').scrollTop = 0
            } else if( key === 'end' ) {
                ev.preventDefault()
                let list = document.getElementById('monster-list')
                list.scrollTop = list.scrollHeight
            } else if( key === 'escape' || key === 'b' ) {
                ev.preventDefault()
                this.actions.closeMonsterBook()
            }
            return
        }

        if( this.isMenuOpen() ) {
            if( key === '1' || key === 'r' ) {
                ev.preventDefault()
                this.actions.refreshGame()
            } else if( key === '2' ) {
                ev.preventDefault()
                this.actions.saveGame()
            } else if( key === '3' ) {
                ev.preventDefault()
                this.actions.loadGame()
            } else if( key === '4' || key === 'escape' || key === 'm' ) {
                ev.preventDefault()
                this.actions.closeMenu()
            }
            return
        }

        if( editable && key !== 'escape' ) {
            return
        }

        if( key === 'escape' ) {
            return
        }

        if( key === 'm' ) {
            ev.preventDefault()
            this.actions.openMenu()
        } else if( key === 'b' ) {
            ev.preventDefault()
            this.actions.openMonsterBook()
        } else if( key === 't' ) {
            ev.preventDefault()
            this.actions.useTeleport()
        } else if( key === 'g' ) {
            ev.preventDefault()
            this.actions.openCheat()
        } else if( key === 'k' ) {
            ev.preventDefault()
            this.actions.blinkPrevFloor()
        } else if( key === 'l' ) {
            ev.preventDefault()
            this.actions.blinkNextFloor()
        }
    }
}

export default new Hotkeys()
