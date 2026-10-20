// Traduz HTTP <-> service. Sem regra de negócio.
export class EntregasController {
  constructor(service) {
    this.service = service;
  }

  criar = async (req, res) => {
    res.status(201).json(await this.service.criar(req.body));
  };

  listar = async (req, res) => {
    res.status(200).json(await this.service.listar(req.query));
  };

  buscarPorId = async (req, res) => {
    res.status(200).json(await this.service.buscarPorId(req.params.id));
  };

  historico = async (req, res) => {
    res.status(200).json(await this.service.historico(req.params.id));
  };

  avancar = async (req, res) => {
    res.status(200).json(await this.service.avancar(req.params.id));
  };

  cancelar = async (req, res) => {
    res.status(200).json(await this.service.cancelar(req.params.id));
  };

  atribuir = async (req, res) => {
    res.status(200).json(await this.service.atribuir(req.params.id, req.body));
  };
}
