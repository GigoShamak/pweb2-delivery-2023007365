// Traduz HTTP <-> service. Sem regra de negócio.
export class EntregasController {
  constructor(service) {
    this.service = service;
  }

  criar = (req, res) => {
    res.status(201).json(this.service.criar(req.body));
  };

  listar = (req, res) => {
    res.status(200).json(this.service.listar(req.query));
  };

  buscarPorId = (req, res) => {
    res.status(200).json(this.service.buscarPorId(req.params.id));
  };
}
