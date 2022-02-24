	window.Vue = Vue
	console.log(window.Vue) 
		if (!self.fetch) {
		    alert('Navegador incompatível com esse site.')
		}

        new Vue({
            el: '#app',
            data: {
                carregando: false,
                provas: [
                    { titulo: "Legislação de Telecomunicações", arquivo: "anatel-legislacao.json" },
                    { titulo: "Técnica e Ética Operacional", arquivo: "anatel-operacional.json" },
                    { titulo: "Eletrônica e Eletricidade", arquivo: "anatel-eletrica.json" },
                ],
                provaSelecionada: null,
				perguntas: [],
                perguntasSelecionadas: [],
                indicePerguntaAtual: null,
                alternativaEscolhida: null,
                cronometro: 0,
                temporizadorCronometro: null
            },
            mounted() {
                document.querySelector('.loading-overlay').classList.remove("is-active")
            },
            watch: {
                'provaSelecionada': async function(valor) {
                    if (valor) {
                        await this.carregarPerguntas()
                        this.selecionarPerguntas()
                        this.indicePerguntaAtual = 0
                        this.iniciarCronometro()
                        this.carregando = true
                    }
                }
            },
            methods: {
                avancar() {
                    if (_.isNull(this.alternativaEscolhida)) {
                        this.$buefy.dialog.alert({
                            message: 'Escolha uma das alternativas para continuar',
                            type: 'is-danger',
                            hasIcon: true,
                            icon: 'times-circle',
                            iconPack: 'fa',
                            ariaRole: 'alertdialog',
                            ariaModal: true
                        })
                        return
                    }

                    this.perguntasSelecionadas[this.indicePerguntaAtual].alternativaEscolhida = this.alternativaEscolhida
                    this.indicePerguntaAtual++
                    this.alternativaEscolhida = null
                },
				async carregarPerguntas() {
					var that = this
					var resposta = await fetch(this.provaSelecionada.arquivo)
					var resultado = await resposta.json()
					this.perguntas = resultado
				},
				selecionarPerguntas() {
                    this.perguntasSelecionadas = _(this.perguntas).filter({ anulada: false }).shuffle().slice(0, 1168).forEach(function(pergunta) {
                        if (pergunta.embaralhar_alternativas) {
                            pergunta.alternativas = _.shuffle(pergunta.alternativas)
                        }
					})
				},
                iniciarCronometro() {
                    this.cronometro = 0
                    this.temporizadorCronometro = setInterval(this.atualizarCronometro, 1000)
                },
                atualizarCronometro() {
                    if (this.terminou) {
                        clearInterval(this.temporizadorCronometro)
                    } else {
                        this.cronometro++
                    }
                }
            },
            computed: {
                perguntaAtual() {
                    return this.perguntasSelecionadas[this.indicePerguntaAtual]
                },
                terminou() {
                    return this.indicePerguntaAtual === this.totalPerguntas
                },
                totalAcertos() {
                    return _.reduce(this.perguntasSelecionadas, function(acertos, pergunta) {
                        if (pergunta.alternativas[pergunta.alternativaEscolhida].correta) {
                            return acertos + 1
                        } else {
                            return acertos
                        }
                    }, 0)
                },
                totalPerguntas() {
                    return this.perguntasSelecionadas.length
                },
                porcentagemAcerto() {
                    return parseFloat(((this.totalAcertos / this.totalPerguntas) * 100).toFixed(2))
                },
                porcentagemProgresso() {
                    return parseFloat(((this.indicePerguntaAtual / this.totalPerguntas) * 100).toFixed(2))
                }
            },
            filters: {
                formatarSegundos(valor) {
                    var cronometro = parseInt(valor, 10)
                    var hora = Math.floor(cronometro / 3600)
                    var minuto = Math.floor((cronometro - (hora * 3600)) / 60)
                    var segundo = cronometro - (hora * 3600) - (minuto * 60)

                    if (hora < 10) { hora = '0' + hora }
                    if (minuto < 10) { minuto = '0' + minuto }
                    if (segundo < 10) { segundo = '0' + segundo }

                    return hora + ':' + minuto + ':' + segundo
                }
            }
        })
